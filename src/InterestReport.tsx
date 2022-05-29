import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Close from '@mui/icons-material/Close';

import './InterestReport.css';

import { InterestResponse } from './aggregate';
import { SectionTotalsTab } from './SectionTotalsTab';

export type InterestReportProps = {
  time: string;
  hideF: () => void;
  getResponsesP: Promise<Array<InterestResponse>>;
};

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

export function InterestReport(props: InterestReportProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [rsvps, setRsvps] = useState([] as Array<InterestResponse>);

  function handleTabChange(e: React.SyntheticEvent, newActiveTab: number) {
    setActiveTab(newActiveTab);
  }

  props.getResponsesP.then(setRsvps);
  const affirmatives = rsvps.filter(r => r.rsvp > 0);
  const maybes = rsvps.filter(r => r.rsvp === 0);
  const negatives = rsvps.filter(r => r.rsvp < 0);

  return(
    <Card className="InterestReportCard" raised={true}>
      <Tooltip title="Hide rsvp report">
        <Button sx={{position: 'absolute' }} className="CloseButton" onClick={props.hideF}>
          <Close />
        </Button>
      </Tooltip>

      <Typography>
        { props.time }
      </Typography>

      <Typography>
        Total responses: { rsvps.length }
      </Typography>
      <Card raised={true}>
        <Tabs aria-label="summarize interest by" onChange={handleTabChange} value={activeTab}>
          <Tab label="Roll Call" aria-label="total roll call" />
          <Tab label="Section Roll Call" aria-label="section roll call" />
          <Tab label="Section Totals" aria-label="section totals" />
        </Tabs>
      </Card>

          <TabPanel value={activeTab} index={0}>
            <Typography variant="h6">Affirmative ({affirmatives.length})</Typography>
            <List>
              { affirmatives.map((rsvp, i) => (
                  <ListItem key={i}>
                    { rsvp.name } ({ rsvp.section })
                  </ListItem>
                ))
              }
            </List>
            <Typography variant="h6">Maybe ({maybes.length})</Typography>
            <List>
              { maybes.map((rsvp, i) => (
                  <ListItem key={i}>
                    { rsvp.name } ({ rsvp.section })
                  </ListItem>
                ))
              }
            </List>
            <Typography variant="h6">Negative ({negatives.length})</Typography>
            <List>
              { negatives.map((rsvp, i) => (
                  <ListItem key={i}>
                    { rsvp.name } ({ rsvp.section })
                  </ListItem>
                ))
              }
            </List>
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            Fill in later
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <SectionTotalsTab rsvps={rsvps} />
          </TabPanel>
    </Card>
  );
}
