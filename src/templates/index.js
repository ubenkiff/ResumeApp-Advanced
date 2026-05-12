import ExecutiveTemplate from './ExecutiveTemplate';
import ProfessionalTemplate from './ProfessionalTemplate';
import ModernTemplate from './ModernTemplate';
import MinimalTemplate from './MinimalTemplate';

const templates = {
  executive: ExecutiveTemplate,
  professional: ProfessionalTemplate,
  modern: ModernTemplate,
  minimal: MinimalTemplate,
};

export const getTemplate = (style) => {
  return templates[style] || ProfessionalTemplate;
};

export { ExecutiveTemplate, ProfessionalTemplate, ModernTemplate, MinimalTemplate };
