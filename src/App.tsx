import {
  IonApp,
  IonRouterOutlet,
  IonSplitPane,
  IonToast,
  setupIonicReact
} from '@ionic/react';
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
import { ChatContext } from './modules/chat/chat.context';
import { Chat, Membership } from '@pubnub/chat';
import { useCallback, useEffect, useState } from 'react';
import { initializeChatForUser } from './modules/chat/chat.utils';
import ChatPage from './pages/Chat/ChatPage';
import ContactPicker from './pages/ContactPicker/ContactPicker';

setupIonicReact();

function App() {
  const [displayName, setDisplayName] = useLocalStorage('displayName', '');

  const [chat, setChat] = useState<Chat>();

  // initialize chat for user
  useEffect(() => {
    if (!chat && displayName) {
      initializeChatForUser(displayName).then((chat) => {
        setChat(chat);
      })
    }
  }, [displayName, chat]);

  const [activeConversationId, setActiveConversationId] = useState<string>();
  const [conversations, setConversations] = useState<Membership[]>();


  const [eventText, setEventText] = useState<string>('');
  const [eventToastOpen, setEventToastOpen] = useState<boolean>(false);

  // Listen for mentions and show a toast
  // note that channel is the user's id for mention events
  useEffect(() => {
    let unsub: () => void;
    if (chat) {
      chat.listenForEvents({
        channel: chat.currentUser.id,
        type: "mention",
        method: "publish",
        callback: (event) => {
          chat.getChannel(event.payload.channel).then((_channel) => {
            setEventText(`${event.userId} mentioned you in ${_channel?.name}`);
            setEventToastOpen(true);
          })
        }
      })
    }

    return () => {
      unsub && unsub();
    }
  }, [chat]);

  return (
    <ChatContext.Provider value={{ chat: chat as Chat, displayName, setDisplayName, setActiveConversationId }}>
      <IonApp>
        <IonReactRouter>
          <IonSplitPane contentId="main">
            {
              displayName ? (
                <Menu
                  conversations={conversations}
                  setConversations={setConversations}
                  setActiveConversationId={setActiveConversationId}
                  activeConversationId={activeConversationId}
                />
              ) : null
            }
            <IonRouterOutlet id="main">
              <Route path="/" exact={true}>
                {displayName ? <Redirect to="/home" /> : <Redirect to="/pick-name" />}
              </Route>
              <Route path="/pick-name" exact component={PickName} />
              <Route path="/contact-picker" exact component={ContactPicker} />
              <Route path="/chat" exact>
                <ChatPage
                  activeConversationId={activeConversationId}
                />
              </Route>
              <Route path="/home" exact component={Home} />
            </IonRouterOutlet>
          </IonSplitPane>
        </IonReactRouter>
        <IonToast
          isOpen={eventToastOpen}
          message={eventText}
          onDidDismiss={() => setEventToastOpen(false)}
          duration={3000}
          color={'success'}
        ></IonToast>
      </IonApp>
    </ChatContext.Provider>
  );
};

export default App;
