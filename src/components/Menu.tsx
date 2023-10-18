import {
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle
} from '@ionic/react';

import { useHistory, useLocation } from 'react-router-dom';
import { archiveOutline, archiveSharp, bookmarkOutline, chatbubblesOutline, chatbubblesSharp, heartOutline, heartSharp, homeOutline, homeSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, pencilOutline, pencilSharp, trashOutline, trashSharp, warningOutline, warningSharp } from 'ionicons/icons';
import './Menu.css';
import { useContext, useEffect } from 'react';
import { ChatContext } from '../modules/chat/chat.context';

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Home',
    url: '/home',
    iosIcon: homeOutline,
    mdIcon: homeSharp
  },
  {
    title: 'Change Display Name',
    url: '/pick-name',
    iosIcon: pencilOutline,
    mdIcon: pencilSharp
  }
];

// type set to any to carry the extra property of unreadMessagesCount
type MenuProps = {
  conversations?: any[];
  setConversations: (conversations: any[]) => void; // memberships
  activeConversationId: string | undefined;
  setActiveConversationId: (id: string) => void;
}

const Menu: React.FC<MenuProps> = ({
  conversations = [],
  setConversations,
  activeConversationId,
  setActiveConversationId
}: MenuProps) => {
  const location = useLocation();

  const { chat } = useContext(ChatContext);

  // get all channels that the user is a member of,
  // and get the unread messages count for each channel
  useEffect(() => {
    if (chat) {
      chat.currentUser.getMemberships().then((_conversations) => {
        chat.getUnreadMessagesCounts().then((_unreadMessagesCounts) => {
          const _conversationsWithUnreadMessages = _conversations.memberships.map((_conversation) => {
            const _unreadMessagesCount = _unreadMessagesCounts.find((_uMC) => _uMC.channel.id === _conversation.channel.id)?.count || 0;
            return {
              ..._conversation,
              unreadMessagesCount: _unreadMessagesCount
            }
          })
          setConversations(_conversationsWithUnreadMessages);
        })
      })

    }
  }, [chat])

  const history = useHistory();

  return (
    <IonMenu contentId="main" type="overlay">
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Pages</IonListHeader>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon aria-hidden="true" slot="start" ios={appPage.iosIcon} md={appPage.mdIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        <IonList id="labels-list">
          <IonListHeader>Conversations</IonListHeader>
          {conversations.map((conversation) => (
            <IonItem
              button
              lines="none"
              key={conversation.channel.id}
              onClick={() => {
                setActiveConversationId(conversation.channel.id);
                if (history.location.pathname !== '/chat') {
                  history.push('/chat');
                }
              }}
            >
              <IonIcon
                aria-hidden="true"
                slot="start"
                icon={conversation.channel.id === activeConversationId ? chatbubblesSharp : chatbubblesOutline}
              />
              <IonLabel
                className={conversation.channel.id === activeConversationId ? 'selected' : ''}
              >
                {`${conversation.channel.name} (${conversation.unreadMessagesCount})`}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};

export default Menu;
