import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import './InterestIndicator.css';

export type InterestIndicatorProps = {
  numMaybe: number;
  numNo: number;
  numYes: number;
};

export function InterestIndicator(props: InterestIndicatorProps) {
  const { numMaybe = 0, numNo = 0, numYes = 0 } = props;
  // pad the number of responses to make empty count stripes appear.
  const numResponses3 = 3 + numMaybe + numNo + numYes;

  function noWidth(): string {
    return `${100*(numNo+1)/numResponses3}%`;
  }

  function maybeWidth(): string {
    return `${100*(numMaybe+1)/numResponses3}%`;
  }

  function yesWidth(): string {
    return `${100*(numYes+1)/numResponses3}%`;
  }

  return(
    <Stack className="InterestIndicatorDiv" direction="row">

      <Box className="RSVPNegative" sx={{ width: noWidth() }}>
        <Typography align="left" sx={{ marginLeft: '.2em' }}>
          { props.numNo ? props.numNo : '' }
        </Typography>
      </Box>

      <Box className="RSVPMaybe" sx={{ width: maybeWidth() }}>
        <Typography align="center">
          { props.numMaybe ? props.numMaybe : '' }
        </Typography>
      </Box>

      <Box className="RSVPPositive" sx={{ width: yesWidth() }}>
        <Typography align="right" sx={{ marginRight: '.2em' }}>
          { props.numYes ? props.numYes : '' }
        </Typography>
      </Box>
    </Stack>
  );
}
