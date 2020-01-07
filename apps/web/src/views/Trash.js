import React from "react";
import { db } from "../common";
import * as Icon from "react-feather";
import ListItem from "../components/listview";

const dropdownRefs = [];
const menuItems = [
  { title: "Restore" },
  {
    title: "Delete",
    color: "red"
  }
];

function Trash() {
  return (
    <ListItem
      type="Trash"
      getItems={db.getTrash}
      menu={{ menuItems, dropdownRefs }}
      button={{
        callToAction: "Clear Trash",
        icon: Icon.Trash2,
        onClick: () => db.clearTrash()
      }}
    />
  );
}

export default Trash;
