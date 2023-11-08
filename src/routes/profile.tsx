import { styled } from "styled-components";
import { auth, db, storage } from "../firebase"
import React, { useState, useEffect } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: balck;
  color: yellow;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg{
    width: 80px;
  }
`;
const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 18px;
`;
const Tweets = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
const Column = styled.div``;

const EditNameInput = styled.input``;
const EditNameImg = styled.label`
  background-image: url('./public/pencil.svg');
  cursor: pointer;
  color: white;
`;
const EditNameBtn = styled.button`
  display: flex;
`;

export default function Profile(){
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(user?.displayName);

  const onAvatarChange = async(e:React.ChangeEvent<HTMLInputElement>) => {
    const {files} = e.target;
    if (!user) return;
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };

  const fetchTweets = async () => {
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map(doc => {
      const {tweet, createdAt, userId, username, photo} = doc.data();
      return {
        tweet, 
        createdAt, 
        userId, 
        username, 
        photo,
        id: doc.id
      };    
    });
    setTweets(tweets);
  };
  useEffect(() => {
    fetchTweets();
  }, []);

  const onEditName = async() => {
    if (!user) return;
    if (editMode) {
      await updateProfile(user, {
        displayName: editName,
      });
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };

  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} /> 
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            className="w-5 h-5"
          >
            <path   
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
          </svg>
        )
      }
      </AvatarUpload>
      <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
      <Column>
        {editMode ? (
          <EditNameInput 
            value={editName || ""}
            onChange={(e) => setEditName(e.target.value)} />
        ) : (
          <Name>{user?.displayName ?? "Anonymous"}</Name>
        )}
          <EditNameImg htmlFor="editname">
            <EditNameBtn
              onClick={onEditName}
              id="editname"
            >{editMode ? "save" : "edit"}</EditNameBtn>
          </EditNameImg>
      </Column>
      <Tweets>
        {tweets.map(tweet => <Tweet key={tweet.id} {...tweet} />)}
      </Tweets>
    </Wrapper>
  )
}