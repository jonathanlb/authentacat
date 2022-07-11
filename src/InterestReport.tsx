import React, { useState, useEffect } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Close from '@mui/icons-material/Close';

import { Observable } from 'rxjs';

import './InterestReport.css';

import { InterestResponse } from './aggregate';
import { RollCallTab } from './RollCallTab';
import { SectionRollCallTab } from './SectionRollCallTab';
import { SectionTotalsTab } from './SectionTotalsTab';
import { TabPanel } from './TabBoiler';

export type InterestReportProps = {
  time: string;
  hideF: () => void;
  responses: Observable<Array<InterestResponse>>;
};

export function InterestReport(props: InterestReportProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [rsvps, setRsvps] = useState([] as Array<InterestResponse>);

  function handleTabChange(e: React.SyntheticEvent, newActiveTab: number) {
    setActiveTab(newActiveTab);
  }

  useEffect(() => {
    const sub = props.responses.subscribe(setRsvps);
    return () => sub.unsubscribe();
  }, [ props.responses] );

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
            <RollCallTab rsvps={rsvps} />
          </TabPanel>

          <TabPanel value={activeTab} index={1}>
            <SectionRollCallTab rsvps={rsvps} />
          </TabPanel>

          <TabPanel value={activeTab} index={2}>
            <SectionTotalsTab rsvps={rsvps} />
          </TabPanel>
    </Card>
  );
}
