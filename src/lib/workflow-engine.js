// Table-driven workflow engine — reads state definitions from the DB
// so admins can tweak the flow without code changes

const { query, queryOne, execute } = require('./db');

class WorkflowEngine {
  async getStateDefinition(workflowType, stateName) {
    return queryOne(
      'SELECT * FROM workflow_definitions WHERE workflow_type = ? AND state_name = ?',
      [workflowType, stateName]
    );
  }

  async getWorkflowStates(workflowType) {
    return query(
      'SELECT * FROM workflow_definitions WHERE workflow_type = ? ORDER BY state_order',
      [workflowType]
    );
  }

  async canTransition(caseId, targetState) {
    const caseData = await queryOne('SELECT * FROM cases WHERE id = ?', [caseId]);
    if (!caseData) return { valid: false, reason: 'Case not found' };

    const currentDef = await this.getStateDefinition(caseData.workflow_type, caseData.current_state);
    if (!currentDef) return { valid: false, reason: 'Current state definition not found' };

    const allowed = JSON.parse(currentDef.allowed_transitions);
    if (!allowed.includes(targetState)) {
      return {
        valid: false,
        reason: `Cannot transition from "${caseData.current_state}" to "${targetState}". Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
      };
    }

    // Check if required artifacts for current state are approved
    const requiredArtifacts = JSON.parse(currentDef.required_artifacts);
    for (const artifactType of requiredArtifacts) {
      const approved = await queryOne(
        "SELECT * FROM artifacts WHERE case_id = ? AND artifact_type = ? AND status = 'approved' ORDER BY version DESC LIMIT 1",
        [caseId, artifactType]
      );
      if (!approved) {
        return {
          valid: false,
          reason: `Required artifact "${artifactType}" must be approved before transitioning from "${caseData.current_state}"`,
        };
      }
    }

    return { valid: true };
  }

  async transition(caseId, targetState, actorId) {
    const check = await this.canTransition(caseId, targetState);
    if (!check.valid) {
      throw new Error(check.reason);
    }

    const caseData = await queryOne('SELECT * FROM cases WHERE id = ?', [caseId]);
    const fromState = caseData.current_state;

    // Update the case state
    await execute(
      "UPDATE cases SET current_state = ?, updated_at = datetime('now') WHERE id = ?",
      [targetState, caseId]
    );

    // Log the transition
    await execute(
      'INSERT INTO audit_log (id, case_id, actor_id, action_type, details) VALUES (?, ?, ?, ?, ?)',
      [
        crypto.randomUUID(),
        caseId,
        actorId,
        'state_transition',
        JSON.stringify({ from: fromState, to: targetState }),
      ]
    );

    return { from: fromState, to: targetState };
  }

  // returns current position + completion % for the progress bar
  async getCaseProgress(caseId) {
    const caseData = await queryOne('SELECT * FROM cases WHERE id = ?', [caseId]);
    if (!caseData) return null;

    const allStates = await this.getWorkflowStates(caseData.workflow_type);
    const currentIdx = allStates.findIndex((s) => s.state_name === caseData.current_state);

    return {
      currentState: caseData.current_state,
      currentStateOrder: currentIdx + 1,
      totalStates: allStates.length,
      percentComplete: Math.round(((currentIdx) / (allStates.length - 1)) * 100),
      states: allStates.map((s, i) => ({
        name: s.state_name,
        description: s.description,
        status: i < currentIdx ? 'completed' : i === currentIdx ? 'current' : 'upcoming',
      })),
    };
  }
}

module.exports = new WorkflowEngine();
