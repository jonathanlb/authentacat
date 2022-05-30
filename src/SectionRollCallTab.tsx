import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { InterestResponse } from './aggregate';
import { RollCallTab } from './RollCallTab';
import { TabPanel, TabPanelProps } from './TabBoiler';

export type SectionRollCallTabProps = {
  rsvps: Array<InterestResponse>,
}

export function SectionRollCallTab(props: SectionRollCallTabProps) {
  const [activeTab, setActiveTab] = useState(0);

  const section2rsvps = new Map<string,Array<InterestResponse>>();
  props.rsvps.forEach(rsvp => {
    const { section } = rsvp;
    if (section2rsvps.has(section)) {
      section2rsvps.get(section)?.push(rsvp);
    } else {
      section2rsvps.set(section, [rsvp]);
    }
  })

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
          { Array.from(section2rsvps.keys()).map(section => (
              <Tab key={section} label={section} aria-label={`${section} roll call`} />
            ))
          }
        </Tabs>
      </Card>

      { Array.from(section2rsvps.entries()).map((kv, i) => (
          <TabPanel value={activeTab} index={i} key={kv[0]}>
            <RollCallTab rsvps={kv[1]} hideSection={true} />
          </TabPanel>
        ))
      }

    </Box>
  );
}
