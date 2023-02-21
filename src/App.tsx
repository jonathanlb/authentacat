import { useEffect } from 'react';

import './App.css';

import { AuthEventData } from '@aws-amplify/ui';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { BehaviorSubject } from 'rxjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { ThemeProvider } from '@mui/material';

import { handleErrorSignOut } from './App.util';
import { AppHeader } from './components/AppHeader';
import { config } from './config';
import { EventContent } from './components/EventContent';
import { LoginInfo } from './LoginInfo';
import { ServerInterface } from './rest/serverInterface';

import theme from './theme';

export type AppProps = {
  config: ServerInterface;
  latestEventFirst: BehaviorSubject<boolean>;
  listAllEvents: BehaviorSubject<boolean>;
  showRideShare?: boolean;
}

const eventFilter = new BehaviorSubject<string>('');

function App(props: AppProps) {
  let unsub = Promise.resolve(() => { });

  useEffect(() => {
    return () => {
      unsub.then(f => f());
    }
  });

  function createContent(userName: string, signOut?: (data?: AuthEventData | undefined) => void) {
    return (
      <ThemeProvider theme={theme}>
        <Card className="App">
          <AppHeader homeHref={config.homeHref}
            filter={eventFilter}
            latestEventFirst={props.latestEventFirst}
            listAllEvents={props.listAllEvents}
            logoImageSrc="logo.png"
            logoImageSrcAlt={config.logoAltTxt}
            signOut={signOut}
            userName={userName} />
          <EventContent
            eventCards={props.config.eventCards}
            filter={eventFilter}
            latestEventFirst={props.latestEventFirst}
            showRideShare={props.showRideShare}
            userName={userName} />
        </Card>
      </ThemeProvider>
    );
  }

  if (props.config.passwordless) {
    const userName = 'Demo User';
    const signOut = () => { };
    props.config.start(signOut);
    return createContent(userName, signOut);
  } else {
    const authComps = {
      Footer: () => {
        return <LoginInfo />
      }
    }
    return (
      <Box className='LoginBox'>
        <Authenticator components={authComps} hideSignUp >
          {({ signOut, user }) => {
            unsub = handleErrorSignOut(props.config, signOut as () => void);
            const userName = user?.attributes?.name || '???';
            return createContent(userName, signOut);
          }}
        </Authenticator>
      </Box>
    );
  }
}

export default App;
