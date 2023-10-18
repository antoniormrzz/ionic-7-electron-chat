import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonRouter
} from '@ionic/react';
import './ContactPicker.css';
import { useContext, useEffect, useState } from 'react';
import { ChatContext } from '../../modules/chat/chat.context';
import { User } from '@pubnub/chat';
import { createOutline } from 'ionicons/icons';
import moment from 'moment';

const ContactPicker: React.FC = () => {
  const { chat, displayName, setActiveConversationId } = useContext(ChatContext);

  const router = useIonRouter();

  const [contacts, setContacts] = useState<User[]>([]);

  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  const handleItemClicked = (contact: User) => {
    if (selectedContactIds.includes(contact.id)) {
      setSelectedContactIds(selectedContactIds.filter((_id) => _id !== contact.id));
    } else {
      setSelectedContactIds([...selectedContactIds, contact.id]);
    }
  }

  const handleCreateConversation = () => {
    if (chat) {
      if (selectedContactIds.length === 1) {
        const selectedContact = contacts.find((_contact) => _contact.id === selectedContactIds[0]);
        // create a direct channel with the selected contact
        chat.createDirectConversation({
          user: selectedContact as User,
          channelData: {
            name: selectedContact?.id
          }
        }).then((_res) => {
          setActiveConversationId(_res.channel.id);
          router.push('/chat');
        })
      } else {
        const mappedContacts = (selectedContactIds
          .map((_id) => contacts.find((_contact) => _contact.id === _id)) as User[])
          .sort((_a, _b) => _a.id.localeCompare(_b.id));
        // create a group channel with the selected contacts
        chat.createGroupConversation({
          users: mappedContacts,
          channelId: `group_${mappedContacts.length}_${Date.now()}`,
          channelData: {
            // remove _user suffix from display names before joining
            name: mappedContacts.map((_contact) => _contact.id.replace('_user', '')).join(',')
          }
        }).then((_res) => {
          setActiveConversationId(_res.channel.id);
          router.push('/chat');
        })

      }
    }
  }

  useEffect(() => {
    if (chat) {
      // get all users that are not the current user
      chat.getUsers({}).then((_results) => {
        setContacts(_results.users.filter((_user) => _user.id !== chat.currentUser.id));
      });
    }
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref='/home' />
          </IonButtons>
          <IonTitle>Choose Contacts</IonTitle>
          <IonButtons slot="end">
            <IonButton
              disabled={selectedContactIds.length === 0}
              onClick={handleCreateConversation}
            >
              <IonIcon icon={createOutline}></IonIcon>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Choose Contacts</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonList className='h-full'>
          {contacts.map((contact) => (
            <IonItem key={contact.id} onClick={() => handleItemClicked(contact)}>
              <IonLabel>{contact.name} {moment((contact.lastActiveTimestamp) ?? Date.now()).fromNow()}</IonLabel>
              <IonCheckbox checked={selectedContactIds.includes(contact.id)} />
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ContactPicker;
