import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonIcon,
  IonImg,
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

type MessageCardProps = {
  message: Message;
  onPin: (message: Message) => void;
  onToggleLike: (message: Message) => void;
  readBy: string[];
  onForward: (message: Message) => void;
  onReply: (message: Message) => void;
  onThread: (message: Message) => void;
  onDelete: (message: Message) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({
  message,
  onPin,
  onToggleLike,
  readBy,
  onForward,
  onReply,
  onThread,
  onDelete
}: MessageCardProps) => {
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

  // toggle like on the message
  const handleToggleLike = useCallback(() => {
    message.toggleReaction("like").then((_message) => {
      onToggleLike(_message);
    })
  }, [message, onToggleLike]);

  // check if the current user has liked the message
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

  // reconstruct the message content from message parts
  const messageContent = useMemo(() => {
    let _messageContent = (<> </>)
    if (message.files?.length > 0) {
      _messageContent = (
        <IonImg src={message.files[0].url} />
      )
    }

    return [_messageContent, ...message.getLinkedText().map((text, index) => {
      if (text.type === "textLink") {
        return (
          <IonText key={index} color="primary">
            <a href={text.content.link} target="_blank" rel="noreferrer">{text.content.text}</a>
          </IonText>
        )
      } else if (text.type === "channelReference") {
        return (
          <IonText key={index} color={"warning"}>#{text.content.name}</IonText>
        )
      } else if (text.type === "mention") {
        return (
          <IonText key={index} color={"success"}>@{text.content.name}:{text.content.id}</IonText>
        )
      } else if (text.type === "text") {
        return text.content.text
      }
    })]
  }, [message])


  return (
    <IonCard>
      <IonCardHeader>
        <IonToolbar>
          {/* display the user's name and original publisher if the message is forwarded */}
          <IonCardSubtitle>{message.userId} {message.meta?.originalPublisher ? 'FRW(' + message.meta?.originalPublisher + ')' : null}</IonCardSubtitle>
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
                <IonButton fill="clear" onClick={() => onForward(message)}>Forward</IonButton>
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
              {readBy.length > 0 ? (<IonItem>
                {readBy.join(', ')}
              </IonItem>) : null}
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
        {messageContent}
      </IonCardContent>
      <IonButton fill="clear" onClick={handleToggleLike}>
        {
          isLiked ?
            (<IonIcon icon={heart} />) :
            (<IonIcon icon={heartOutline} />)
        }
        ({message.reactions["like"]?.length || 0})
      </IonButton>
      <IonButton fill="clear" onClick={() => onThread(message)}>Thread</IonButton>
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

export default MessageCard;
