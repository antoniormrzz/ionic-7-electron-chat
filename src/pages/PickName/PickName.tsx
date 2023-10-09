import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { useLocalStorage } from '../../utils/useLocalStorage.util';
import { useCallback, useContext, useState } from 'react';
import { useMaskito } from '@maskito/react';
import cnm from '../../utils/cnm.util';
import { ChatContext } from '../../modules/chat/chat.context';

function PickName({ history }:  any) {
  const { chat, displayName, setDisplayName } = useContext(ChatContext);

  const [ displayNameInput, setDisplayNameInput ] = useState(displayName);
  const [isTouched, setIsTouched] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const validate = useCallback((ev: Event) => {
    const value = (ev.target as HTMLInputElement).value;
    setIsTouched(true);
    value === '' ? setIsValid(false) : setIsValid(true);
  }, []);

  const displayNameMask = useMaskito({
    options: {
      // regex to only allow small and capital letters, numbers and underscores
      mask: /^[a-zA-Z0-9_]+$/,
    },
  });

  const handleInput = useCallback((event: any) => {
    validate(event)
    setDisplayNameInput(event.target.value);
  }, [validate])


  const handleSave = useCallback(() => {
    if(isValid && !chat) {
      setDisplayName(displayNameInput);
      // navigate to home
      window.location.replace('/home')
    } else if(isValid && chat) {
      setDisplayName(displayNameInput);
      window.location.replace('/home')
    } else {
      setIsTouched(true);
    }
  }, [displayNameInput, isValid, history, chat]);


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Pick a display name</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Pick a display name</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonItem>
          <IonInput
            ref={async (displayRef) => {
              if (displayRef) {
                const input = await displayRef.getInputElement();
                displayNameMask(input);
              }
            }}
            placeholder="Display Name"
            value={displayNameInput}
            className={
              cnm({
                'ion-valid': isValid === true,
                'ion-invalid': isValid === false,
                'ion-touched': isTouched,
              })
            }
            errorText="Can't be empty"
            onIonInput={handleInput}
          />
        </IonItem>
        <IonButton onClick={handleSave}>Save</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default PickName;
