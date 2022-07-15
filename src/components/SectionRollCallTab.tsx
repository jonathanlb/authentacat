import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { groupBy, InterestResponse } from '../aggregate';
import { RollCallTab } from './RollCallTab';
import { TabPanel } from './TabBoiler';

export type SectionRollCallTabProps = {
  rsvps: Array<InterestResponse>,
}

export function SectionRollCallTab(props: SectionRollCallTabProps) {
  const [activeTab, setActiveTab] = useState(0);

  const section2rsvps = groupBy(props.rsvps, 'section');

  function handleTabChange(e: React.SyntheticEvent, newActiveTab: number) {
    setActiveTab(newActiveTab);
  }

  return(
    <Box>
      <Card raised={true}>
        <Tabs 
          aria-label="summarize interest section" 
          onChange={handleTabChange} 
          scrollButtons="auto"
          value={activeTab}
          variant="scrollable"
        >
          <Tab key="_all_sections_"
            label="All Sections"
            aria-label="All Sections roll call"
            data-testid="all-sections-roll-call-tab" />
          { Array.from(section2rsvps.keys()).map(section => (
              <Tab key={section}
                label={section}
                aria-label={`${section} roll call`}
                data-testid={`${section}-section-roll-call-tab`} />
            ))
          }
        </Tabs>
      </Card>
      <TabPanel value={activeTab} index={0} key="_all_sections_">
        { Array.from(section2rsvps.entries()).map((kv, i) => (
            <Card style={{margin:'2%', padding:'2%'}} key={kv[0]}>
              <Typography variant="h4">
                {kv[0]}
              </Typography>
              <RollCallTab rsvps={kv[1]} hideSection={true} hideNonResponses={true} />
            </Card>
          ))
        }
      </TabPanel>

      { Array.from(section2rsvps.entries()).map((kv, i) => (
          <TabPanel value={activeTab} index={i+1} key={kv[0]}>
            <RollCallTab rsvps={kv[1]} hideSection={true} />
          </TabPanel>
        ))
      }

    </Box>
  );
}
