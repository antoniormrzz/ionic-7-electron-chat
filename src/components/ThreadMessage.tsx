import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonIcon,
  IonItem,
  IonList,
  IonPopover,
  IonText,
  IonToast,
  IonToolbar
} from "@ionic/react";
import { Message } from "@pubnub/chat";
import { ellipsisVertical, heart, heartOutline } from "ionicons/icons";
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { ChatContext } from "../modules/chat/chat.context";

type ThreadMessageProps = {
  message: Message;
  onPin: (message: Message) => void;
  onToggleLike: (message: Message) => void;
  onReply: (message: Message) => void;
  onDelete: (message: Message) => void;
}

// simpler version of MessageCard for threads
const ThreadMessage: React.FC<ThreadMessageProps> = ({
  message,
  onPin,
  onToggleLike,
  onReply,
  onDelete
}: ThreadMessageProps) => {
  const popover = useRef<HTMLIonPopoverElement>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const [isReportToastOpen, setIsReportToastOpen] = useState(false);

  const openPopover = (e: any) => {
    popover.current!.event = e;
    setPopoverOpen(true);
  };

  const { displayName } = useContext(ChatContext);

  // pin the message
  const handlePin = useCallback(() => {
    message.pin().then(() => {
      setPopoverOpen(false);
      onPin(message)
    })
  }, [message, onPin]);

  // toggle like
  const handleToggleLike = useCallback(() => {
    message.toggleReaction("like").then((_message) => {
      onToggleLike(_message);
    })
  }, [message, onToggleLike]);

  // check if the message is liked by the current user
  const isLiked = useMemo(() => {
    return message.hasUserReaction("like")
  }, [message, displayName])

  // report the message
  const handleReport = useCallback(() => {
    message.report("user report").then(() => {
      setIsReportToastOpen(true);
      setPopoverOpen(false);
    })
  }, [message]);

  return (
    <IonCard>
      <IonCardHeader>
        <IonToolbar>
          <IonCardSubtitle>{message.userId}</IonCardSubtitle>
          <IonButtons slot="end">
            <IonButton onClick={openPopover}>
              <IonIcon icon={ellipsisVertical} />
            </IonButton>
          </IonButtons>
          <IonPopover reference="event" ref={popover} isOpen={popoverOpen} onDidDismiss={() => setPopoverOpen(false)}>
            <IonList>
              <IonItem>
                <IonButton fill="clear" onClick={() => onReply(message)}>Reply</IonButton>
              </IonItem>
              <IonItem>
                <IonButton fill="clear" onClick={handlePin}>Pin</IonButton>
              </IonItem>
              {message.userId === displayName + '_user' ? null :
                <IonItem>
                  <IonButton
                    fill="clear"
                    onClick={handleReport}
                  >
                    Report
                  </IonButton>
                </IonItem>
              }
              {message.userId === displayName + '_user' ?
                <IonItem>
                  <IonButton fill="clear" onClick={() => onDelete(message)}>Delete</IonButton>
                </IonItem> : null
              }
            </IonList>
          </IonPopover>
        </IonToolbar>
      </IonCardHeader>

      <IonCardContent>
        {
          message.quotedMessage ? (
            <IonText color={"warning"}>
              {message.quotedMessage.userId} said: {message.quotedMessage.text}
              <br />
            </IonText>
          ) : null
        }
        {message.content.text}
      </IonCardContent>
      <IonButton fill="clear" onClick={handleToggleLike}>
        {
          isLiked ?
            (<IonIcon icon={heart} />) :
            (<IonIcon icon={heartOutline} />)
        }
        ({message.reactions["like"]?.length || 0})
      </IonButton>
      <IonToast
        isOpen={isReportToastOpen}
        message="reported"
        onDidDismiss={() => setIsReportToastOpen(false)}
        duration={2000}
        color={'danger'}
      ></IonToast>
    </IonCard>
  )
}

export default ThreadMessage;
