import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const CollaborationContainer = styled.div`
  background: linear-gradient(135deg, #e3f2fd, #f3e5f5);
  border: 1px solid #bbdefb;
  border-radius: 12px;
  padding: 16px;
  margin: 12px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CollaborationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const CollaborationIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${props => props.theme.gradients.greenDark};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  animation: ${props => props.active ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const CollaborationTitle = styled.div`
  margin: 0;
  color: ${props => props.theme.text.primary};
  font-size: 16px;
  font-weight: 600;
`;

const CollaborationSubtitle = styled.p`
  margin: 0;
  color: ${props => props.theme.text.secondary};
  font-size: 14px;
`;

const AgentsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
`;

const AgentChip = styled.div`
  background: ${props => props.active ? 
    props.theme.gradients.greenDark : 
    'linear-gradient(135deg, #757575, #616161)'};
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.status) {
      case 'working': return props.theme.status.warning;
      case 'completed': return props.theme.primary.darkGreen;
      case 'waiting': return '#757575';
      default: return '#757575';
    }
  }};
  animation: ${props => props.status === 'working' ? 'blink 1s infinite' : 'none'};
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin: 8px 0;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: ${props => props.theme.gradients.greenDark};
  width: ${props => props.progress}%;
  transition: width 0.5s ease;
  border-radius: 3px;
`;

const TasksList = styled.div`
  margin-top: 12px;
`;

const TaskItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 13px;
  color: ${props => props.theme.text.secondary};
`;

const TaskStatus = styled.span`
  font-weight: 500;
  color: ${props => {
    switch (props.status) {
      case 'completed': return '#4caf50';
      case 'in_progress': return '#ff9800';
      case 'pending': return '#757575';
      default: return '#757575';
    }
  }};
`;

function CollaborationStatus({ 
  session, 
  activeAgents = [], 
  onClose 
}) {
  const { theme } = useTheme();
  
  if (!session) return null;
  
  const progress = session.subtasks.length > 0 ? 
    (session.results.length / session.subtasks.length) * 100 : 0;
  
  const getAgentStatus = (agentId) => {
    const assignment = session.assignedAgents.find(a => a.agentId === agentId);
    if (!assignment) return 'waiting';
    
    const hasResult = session.results.some(r => r.agentId === agentId);
    return hasResult ? 'completed' : 'working';
  };
  
  const getTaskStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'in_progress': return 'Em andamento';
      case 'pending': return 'Pendente';
      default: return 'Aguardando';
    }
  };
  
  return (
    <CollaborationContainer theme={theme}>
      <CollaborationHeader>
        <CollaborationIcon active={session.status === 'in_progress'}>
          🤝
        </CollaborationIcon>
        <div>
          <CollaborationTitle theme={theme}>
            Colaboração de Agentes
          </CollaborationTitle>
          <CollaborationSubtitle theme={theme}>
            {session.assignedAgents.length} agentes trabalhando em conjunto
          </CollaborationSubtitle>
        </div>
      </CollaborationHeader>
      
      <ProgressBar>
        <ProgressFill progress={progress} />
      </ProgressBar>
      
      <AgentsList>
        {session.assignedAgents.map(assignment => {
          const agent = activeAgents.find(a => a.id === assignment.agentId);
          const status = getAgentStatus(assignment.agentId);
          
          return (
            <AgentChip key={assignment.agentId} active={status === 'working'}>
              <StatusIndicator status={status} />
              {agent ? agent.name : `Agente ${assignment.agentId}`}
            </AgentChip>
          );
        })}
      </AgentsList>
      
      {session.subtasks.length > 0 && (
        <TasksList>
          {session.subtasks.map(subtask => {
            const result = session.results.find(r => r.subtaskId === subtask.id);
            const status = result ? 'completed' : 
              session.assignedAgents.some(a => 
                session.subtasks.find(st => st.id === subtask.id)
              ) ? 'in_progress' : 'pending';
            
            return (
              <TaskItem key={subtask.id} theme={theme}>
                <StatusIndicator status={status} />
                <span>{subtask.description}</span>
                <TaskStatus status={status}>
                  ({getTaskStatusText(status)})
                </TaskStatus>
              </TaskItem>
            );
          })}
        </TasksList>
      )}
      
      {session.status === 'completed' && (
        <div style={{ 
          marginTop: '12px', 
          padding: '8px', 
          background: '#e8f5e8', 
          borderRadius: '6px',
          fontSize: '13px',
          color: '#2e7d32'
        }}>
          ✅ Colaboração concluída com sucesso!
        </div>
      )}
    </CollaborationContainer>
  );
}

export default CollaborationStatus;