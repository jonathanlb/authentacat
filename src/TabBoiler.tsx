import React from 'react';

import Box from '@mui/material/Box';

// All from https://mui.com/material-ui/react-tabs/

export type TabPanelProps = {
  children?: React.ReactNode;
  value: number;
  index: number;
}

export function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return(
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}
