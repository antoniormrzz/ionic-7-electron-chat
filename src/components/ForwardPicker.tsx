import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar
} from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { ChatContext } from "../modules/chat/chat.context";
import { Membership, Message } from "@pubnub/chat";

type ForwardPickerProps = {
  isForwardPickerOpen: boolean;
  setIsForwardPickerOpen: (isOpen: boolean) => void;
  message: Message | null;
  channelId: string;
}

function ForwardPicker({
  isForwardPickerOpen,
  setIsForwardPickerOpen,
  message,
  channelId
}: ForwardPickerProps) {
  const [conversations, setConversations] = useState<Membership[]>([])

  const { chat } = useContext(ChatContext);

  // get all channels that the user is a member of
  useEffect(() => {
    if (chat) {
      chat.currentUser.getMemberships().then((_conversations) => {
        setConversations(_conversations.memberships.filter((membership) => {
          return membership.channel.id !== channelId;
        }))
      })
    }
  }, [chat])


  return (
    <IonModal isOpen={isForwardPickerOpen}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pick Channel to forward</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setIsForwardPickerOpen(false)}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {
          conversations.map((conversation) => {
            return (
              <IonButton key={conversation.channel.id} onClick={() => {
                // forward the message to the selected channel
                message?.forward(conversation.channel.id).then(() => {
                  setIsForwardPickerOpen(false);
                })
              }}>
                {conversation.channel.name}
              </IonButton>
            )
          })
        }
      </IonContent>
    </IonModal>
  )
}

export default ForwardPicker;