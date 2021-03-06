import React, { useEffect, useState } from "react";
import { useStateValue } from "./StateProvider";
import "./PlaceOrder.css";
// import { auth, firebaseApp } from "../firebase";
import firebase, { db } from "../firebase";
import { auth } from "../firebase";

const PlaceOrder = () => {
  const [{ basket, user }] = useStateValue();
  const [phoneNumber, setPhoneNumber] = useState(0);
  const [address, setAddress] = useState("");

  const [item, setItem] = useState([]);

  // console.log(item);
  console.log(basket);

  useEffect(() => {
    if (basket.length) {
      db.collection("basket")
        .doc(basket[0].hotelId)
        .collection("item")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
          console.log(snapshot);
          setItem(snapshot.docs.map((doc) => doc.data()));
        });
    }
  }, [basket.length && basket[0].hotelId]);

  const setItemInDatabase = () => {
    // e.preventDefault();
    if (basket.length) {
      basket.map((item) => {
        db.collection("basket").doc(item.id).collection("item").add({
          id: user.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          itemName: item.name,
          itemPrice: item.price,
        });
      });
    }
  };

  const updateInfo = (e) => {
    e.preventDefault();
    // console.log(document.querySelector("#recaptcha").innerHTML);
    // return;
    let recaptcha = new firebase.auth.RecaptchaVerifier("recaptcha", {
      size: "normal",
    });
    auth
      .signInWithPhoneNumber(`+91${phoneNumber}`, recaptcha)
      .then((e) => {
        let code = prompt("Enter the OTP- ", "");
        if (code == null) return;
        e.confirm(code).then((result) => {
          document.querySelector("#recaptcha").innerHTML = "";
          // console.log(result);
          setItemInDatabase();
        });
      })
      .catch((err) => alert(err));
  };

  return (
    <div className="placeOrder">
      <h1>Update Info</h1>
      <form onSubmit={updateInfo} className="placeOrder__form">
        <h5>Phone: </h5>
        <input
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="placeOrder__number"
          type="number"
        />
        <h5>Address</h5>
        <textarea
          onChange={(e) => setAddress(e.target.value)}
          className="placeOrder__address"
          cols="30"
          rows="10"
        ></textarea>
        <div id="recaptcha"></div>
        <button type="submit" className="placeOrder__submit">
          Confirm Number
        </button>
      </form>
    </div>
  );
};

export default PlaceOrder;
