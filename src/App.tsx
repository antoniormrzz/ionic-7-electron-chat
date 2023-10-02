import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route } from 'react-router-dom';
import Menu from './components/Menu';
import Home from './pages/Home/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import PickName from './pages/PickName/PickName';
import { useLocalStorage } from './utils/useLocalStorage.util';
import { useState } from 'react';
import { Chat } from '@pubnub/chat';
import { ChatContext } from './modules/chat/chat.context';

setupIonicReact();

function App() {
  const [ displayName, setDisplayName ] = useLocalStorage('displayName', '');

  const [ chat, setChat ] = useState<Chat>();

  return (
    <ChatContext.Provider value={{ chat: chat as Chat, setChat }}>
      <IonApp>
        <IonReactRouter>
          <IonSplitPane contentId="main">
            <Menu />
            <IonRouterOutlet id="main">
              <Route path="/" exact={true}>
                {displayName ? <Redirect to="/home" /> : <Redirect to="/pick-name" />}
              </Route>
              <Route path="/pick-name" exact={true}>
                <PickName />
              </Route>
              <Route path="/home" exact={true}>
                <Home />
              </Route>
            </IonRouterOutlet>
          </IonSplitPane>
        </IonReactRouter>
      </IonApp>
    </ChatContext.Provider>
  );
};

export default App;
