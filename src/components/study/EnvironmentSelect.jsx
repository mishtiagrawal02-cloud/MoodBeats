import { AUDIO_ENVIRONMENTS } from '../../utils/constants';

function EnvironmentSelect({ selectedEnvironment, onSelect }) {
  return (
    <div className="environment-grid">
      {AUDIO_ENVIRONMENTS.map((env) => {
        const isSelected = selectedEnvironment?.id === env.id;
        
        return (
          <button
            key={env.id}
            type="button"
            className={`environment-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onSelect(env)}
            style={{ '--env-color': env.color }}
          >
            <div className="environment-icon">{env.icon}</div>
            <div className="environment-info">
              <h4 className="environment-name">{env.name}</h4>
              <p className="environment-description">{env.description}</p>
              <span className="environment-type">{env.type}</span>
            </div>
            {isSelected && (
              <div className="environment-check">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M16.6666 5L7.49998 14.1667L3.33331 10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default EnvironmentSelect;
