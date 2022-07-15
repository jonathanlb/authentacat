import React from 'react';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { tallyBySection, InterestResponse } from '../aggregate';
import { InterestIndicator } from './InterestIndicator';

export type SectionTotalsTabProps = {
  rsvps: Array<InterestResponse>,
}

export function SectionTotalsTab(props: SectionTotalsTabProps) {
  return(
    <TableContainer component={Paper}>
      <Table aria-label="response by section">
        <TableHead>
          <TableRow>
            <TableCell>Section</TableCell>
            <TableCell>Response</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { tallyBySection(props.rsvps).map((row, i) => (
            <TableRow key={i}>
              <TableCell>
                {row.section} ({row.affirmatives+row.maybes+row.negatives})
              </TableCell>
              <TableCell>
                <InterestIndicator 
                  numYes={row.affirmatives}
                  numMaybe={row.maybes}
                  numNo={row.negatives}/>
                </TableCell>
             </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
