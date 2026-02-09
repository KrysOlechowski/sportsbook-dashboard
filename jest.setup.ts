import "@testing-library/jest-dom";

// Required by React 19 to suppress act() environment warnings in component tests.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;
