import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonFooter,
  IonHeader,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../modules/chat/chat.context";
import { Channel, User } from "@pubnub/chat";
import moment from "moment";

type InviteModalProps = {
  channel: Channel;
  setOpen: (isOpen: boolean) => void;
  isOpen: boolean;
}

function InviteModal({
  channel,
  setOpen,
  isOpen
}: InviteModalProps) {
  const { chat } = useContext(ChatContext);

  const [contacts, setContacts] = useState<User[]>([]);

  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // handle selecting and deselecting contacts
  const handleItemClicked = (contact: User) => {
    if (selectedContactIds.includes(contact.id)) {
      setSelectedContactIds(selectedContactIds.filter((_id) => _id !== contact.id));
    } else {
      setSelectedContactIds([...selectedContactIds, contact.id]);
    }
  }

  // handle inviting the selected contacts based on how many are selected
  const handleInvite = () => {
    if (chat) {
      if (selectedContactIds.length === 1) {
        const selectedContact = contacts.find((_contact) => _contact.id === selectedContactIds[0]);
        channel.invite(selectedContact!).then((_res) => {
          setOpen(false);
        })
      } else {
        const mappedContacts = (selectedContactIds
          .map((_id) => contacts.find((_contact) => _contact.id === _id)) as User[])
          .sort((_a, _b) => _a.id.localeCompare(_b.id));
        channel.inviteMultiple(mappedContacts).then((_res) => {
          setOpen(false);
        })
      }
    }
  }

  // get all users that are not in the channel
  useEffect(() => {
    if (chat && channel) {
      channel.getMembers().then((_members) => {
        let _membersInChannel = _members.members.map((_member) => _member.user.id);
        chat.getUsers({}).then((_results) => {
          setContacts(_results.users.filter((_user) => _membersInChannel.includes(_user.id) === false));
        });
      })
    }
  }, [chat, channel]);


  return (
    <IonModal isOpen={isOpen}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pick user to invite</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setOpen(false)}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {contacts.map((contact) => (
          <IonItem key={contact.id} onClick={() => handleItemClicked(contact)}>
            {/* display the contact's name and last active timestamp,
              note that you need to set the storeUserActivityTimestamps 
              and optionally set storeUserActivityInterval options 
              when initializing the chat SDK
            */}
            <IonLabel>{contact.name} {moment(contact.lastActiveTimestamp ?? Date.now()).fromNow()}</IonLabel>
            <IonCheckbox checked={selectedContactIds.includes(contact.id)} />
          </IonItem>
        ))}
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonButton onClick={handleInvite}>Invite</IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  )
}

export default InviteModal;