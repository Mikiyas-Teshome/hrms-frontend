export const EXECUTIVE_DASHBOARD_QUERY = `
  query ExecutiveDashboard {
    executiveDashboard {
      eligible
      scope
      allowedKpiSlugs
      allowedWidgetSlugs
      layout {
        kpiSlugs
        widgetSlugs
        widgetConfigs
      }
    }
  }
`;

export const UPDATE_EXECUTIVE_DASHBOARD_MUTATION = `
  mutation UpdateExecutiveDashboard($input: UpdateExecutiveDashboardInput!) {
    updateExecutiveDashboard(input: $input) {
      eligible
      scope
      allowedKpiSlugs
      allowedWidgetSlugs
      layout {
        kpiSlugs
        widgetSlugs
        widgetConfigs
      }
    }
  }
`;
