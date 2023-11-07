import { styled } from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 15px;
`;

const Column = styled.div`
  &.editPhoto {
    margin: auto;
  }
`;

const Photo = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 15px;
`;

const Username = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const Payload = styled.p`
  margin: 10px 0px;
  font-size: 18px;
`;

const DeleteButton = styled.button`
  background-color: tomato;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

const EditButton = styled.button`
  background-color: blue;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  margin-left: 5px;
  cursor: pointer;
`;

const TextArea = styled.textarea`
  border: 2px solid white;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 20px;
  border-radius: 10px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: yellow;
  }
`;

const ChangePhotoButton = styled.label`
  padding: 5px 10px;
  color: black;
  background-color: yellow;
  text-align: center;
  border-radius: 5px;
  border: 1px solid yellow;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
      opacity: 0.8;
  }
  align-items: center;
  justify-items: center;
  
`;

const ChangePhotoInput = styled.input`
  display: none;
`;


export default function Tweet({username, photo, tweet, userId, id}: ITweet) {
  const [editMode, setEditMode] = useState(false);
  const [editTweet, setEditTweet] = useState(tweet);
  const [file, setFile] = useState<File | null>(null);
  
  const user = auth.currentUser;
  const onDelete = async() => {
    const ok = confirm("Are you sure you want to delete this tweet?");

    if (!ok || user?.uid !== userId) return;
    try {
      await deleteDoc(doc(db, "tweets", id));
      if (photo) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);
      }
    } catch(e) {
      console.log(e);
    } finally {
    }
  };

  const onEdit = async() => {
    setEditMode((prev) => !prev);
    if (!editMode || user?.uid !== userId) return;
    try {
      if (file !== null) {
        const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
        await deleteObject(photoRef);

        const locationRef = ref(storage, `tweets/${user.uid}/${id}`);
        const result = await uploadBytes(locationRef, file);
        const imgUrl = await getDownloadURL(result.ref);
        updateDoc(doc(db, "tweets", id), {
          tweet: editTweet,
          imgUrl,
        });
      } else {
        updateDoc(doc(db, "tweets", id), {
          tweet: editTweet,
        });
      }
    } catch(e) {
      console.log(e);
    } finally {
      setEditMode(false);
      setFile(null);
    }
  };

  const onTextChange = (e:React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setEditTweet(text);
  };

  const onFileChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const {files} = e.target;
    if (files && files.length === 1) {
      if (files[0].size > 1000000) {
        e.target.value = "";
        return alert("1MB 이하 이미지만 등록 가능합니다.");
      }
      setFile(files[0]);
    }
  };

  return (
    <Wrapper>
      <Column>
        <Username>{username}</Username>
        {editMode ? (
          <TextArea onChange={onTextChange} value={editTweet}></TextArea>
        ) : (
          <Payload>{tweet}</Payload>
        )}
        {user?.uid === userId ? <DeleteButton onClick={onDelete}>Delete</DeleteButton> : null}
        {user?.uid === userId ? (
          <EditButton onClick={onEdit}>
            {editMode ? "save" : "edit"}
          </EditButton>) : null}
      </Column>
      <Column className="editPhoto">
        {editMode ? (
          <>
          <ChangePhotoButton htmlFor="file">
          {file ? "Photo added ✅": "Add photo"}
          </ChangePhotoButton>
          <ChangePhotoInput
            onChange={onFileChange}
            id="file"
            accept="image/*"
            type="file"
          />
          </>
        ) : (
          photo && <Photo src={photo} />
        )}
      </Column>
    </Wrapper>
  );
}