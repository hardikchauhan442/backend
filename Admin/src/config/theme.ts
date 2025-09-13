import { appConfig } from "./app.config";

// Create a theme configuration that properly applies the primary color
export const themeConfig = {
  token: {
    // Color Palette
    colorPrimary: appConfig.theme.primaryColor, 
    // colorSuccess: '#52c41a',
    // colorWarning: '#faad14',
    // colorError: appConfig.theme.secondaryColor,
    // colorInfo: appConfig.theme.primaryColor,
    // colorLink: appConfig.theme.primaryColor,
    
    // // Base/Text
    // colorTextBase: 'rgba(0, 0, 0, 0.85)',
    
    // Border
    // borderRadius: 6,
    
    // Typography
    // fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    
    // Other
    // wireframe: false,
  },
  components: {
    // Button component overrides
    Button: {
      colorPrimary: appConfig.theme.primaryColor,
      primaryColor: '#fff', // Text color for primary buttons
      primaryShadow: '0 2px 0 rgba(70, 245, 39, 0.1)',
      controlOutline: 'rgba(70, 245, 39, 0.1)',
      controlOutlineWidth: 1,
      defaultShadow: '0 2px 0 rgba(0, 0, 0, 0.02)',
    },
    
    // // Menu component overrides
    // Menu: {
    //   itemActiveBg: 'rgba(70, 245, 39, 0.06)',
    //   itemSelectedBg: 'rgba(70, 245, 39, 0.1)',
    //   itemSelectedColor: appConfig.theme.primaryColor,
    //   itemHoverBg: 'rgba(70, 245, 39, 0.04)',
    //   itemHoverColor: appConfig.theme.primaryColor,
    //   horizontalItemSelectedColor: appConfig.theme.primaryColor,
    //   horizontalItemSelectedBg: 'transparent',
    // },
    
    // // Input component overrides
    // Input: {
    //   activeBorderColor: appConfig.theme.primaryColor,
    //   hoverBorderColor: appConfig.theme.primaryColor,
    //   // activeShadow: `0 0 0 2px rgba(70, 245, 39, 0.2)`,
    // },
    
    // // Checkbox component overrides
    // Checkbox: {
    //   colorPrimary: appConfig.theme.primaryColor,
    // },
    
    // // Radio component overrides
    // Radio: {
    //   colorPrimary: appConfig.theme.primaryColor,
    // },
    
    // // Switch component overrides
    // Switch: {
    //   colorPrimary: appConfig.theme.primaryColor,
    //   colorPrimaryHover: appConfig.theme.primaryColor,
    // },
    
    // // Select component overrides
    // Select: {
    //   colorPrimary: appConfig.theme.primaryColor,
    //   // optionSelectedBg: 'rgba(70, 245, 39, 0.1)',
    //   optionSelectedColor: appConfig.theme.primaryColor,
    // },
  },
};
