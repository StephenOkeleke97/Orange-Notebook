import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("notes.db");

export function selectCategories(user, selectCategoriesCallback) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT CategoryName FROM Category C WHERE UserEmail = ?",
      [user],
      (t, { rows: { _array } }) => {
        selectCategoriesCallback(_array);
      },
      (t, error) => console.log("Error in select categories:", error)
    );
  });
}

export function createCategory(
  name,
  user,
  red,
  green,
  blue,
  updateNotesCallBack
) {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO Category(CategoryName, UserEmail, RedColor, GreenColor, BlueColor) VALUES (" +
        "?, ?, ?, ?, ?)",
      [name, user, red, green, blue],
      (t, success) => {
        updateNotesCallBack();
      },
      (t, error) => {
        console.log("Error creating category:", error);
      }
    );
  });
}

export function updateNoteCategories(
  notes,
  categoryName,
  user,
  navigationCallback
) {
  notes.map((note, index, array) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Notes SET CategoryName = ? WHERE NotesID = ? AND " +
          "UserEmail = ?",
        [categoryName, note, user],
        null,
        (t, error) =>
          console.log("Error updating notes when change category:", error)
      );
      if (index === array.length - 1) navigationCallback();
    });
  });
}

export function editCategory(name, red, green, blue, oldName, user) {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE Category SET CategoryName = ?, RedColor = ?, GreenColor = ?, BlueColor = ? " +
        "WHERE CategoryName = ? AND UserEmail = ?",
      [name, red, green, blue, oldName, user],
      null,
      (t, error) => {
        console.log("Error in edit category:", error);
      }
    );
  });
}

export function deleteCategory(
  selectedCategories,
  user,
  deleteCategoryCallBack
) {
  selectedCategories.map((categoryName) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE Notes SET CategoryName = "None", Deleted = "true" WHERE CategoryName = ? ' +
          "AND UserEmail = ?",
        [categoryName, user],
        null,
        (t, error) => {
          console.log(
            "Error setting notes deleted = true in delete category",
            error
          );
        }
      );
      tx.executeSql(
        "DELETE FROM Category WHERE CategoryName = ? AND UserEmail = ?",
        [categoryName, user],
        (t, success) => {
          deleteCategoryCallBack();
        },
        (t, error) => {
          console.log("Error in delete category", error);
        }
      );
    });
  });
}

export function updateCategoryList(updateCallback, user) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT COUNT(NotesID) AS NumOfNotes, C.CategoryName, RedColor, GreenColor, BlueColor " +
        "FROM Category C LEFT JOIN Notes N on C.CategoryName = N.CategoryName " +
        "AND C.UserEmail = N.UserEmail WHERE C.UserEmail = ? " +
        'GROUP BY C.CategoryName HAVING C.CategoryName != "None"',
      [user],
      (t, { rows: { _array } }) => {
        updateCallback(_array);
      },
      (t, error) => {
        console.log("Error in update category list:", error);
      }
    );
  });
}

export function editNote(titleText, labelText, contentText, date, id) {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE Notes SET Title = ?, Label = ?, Content = ?, DateAdded = ? WHERE NotesID = ?",
      [titleText, labelText, contentText, date, id],
      null,
      (t, error) => console.log("Error in edit note: ", error)
    );
  });
}

export function createNewNote(
  titleText,
  user,
  category,
  labelText,
  contentText,
  date,
  time
) {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO Notes(Title, UserEmail, CategoryName, Label, Content, DateAdded, TimeStamp, Deleted, Pinned, Synced) VALUES (" +
        '?, ?, ?, ?, ?, ?, ?, "false", "false", "false")',
      [titleText, user, category, labelText, contentText, date, time],
      null,
      (t, error) => console.log("Error in create note:", error)
    );
  });
}

export function selectAllNotes(deleted, pinned, user, allNoteCallback) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor " +
        "FROM Notes N LEFT JOIN Category C ON N.CategoryName = C.CategoryName  " +
        "AND N.UserEmail = C.UserEmail WHERE Deleted = ? AND Pinned = ? AND N.UserEmail = ? ORDER BY TimeStamp DESC",
      [deleted, pinned, user],
      (t, { rows: { _array } }) => {
        allNoteCallback(_array);
      },
      (t, error) => console.log("Error in select all notes:", error)
    );
  });
}

export function selectNotesOfCategory(
  pinned,
  category,
  user,
  noteCategoryCallback
) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor " +
        "FROM Notes N LEFT JOIN Category C ON N.CategoryName = C.CategoryName AND N.UserEmail = C.UserEmail " +
        'WHERE Deleted = "false" AND Pinned = ? AND N.CategoryName = ? AND N.UserEmail = ? ORDER BY TimeStamp DESC',
      [pinned, category, user],
      (t, { rows: { _array } }) => {
        noteCategoryCallback(_array);
      },
      (t, error) => console.log("Error in select category notes:", error)
    );
  });
}

export function deleteNotes(selectedNotes) {
  selectedNotes.map((noteID) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE Notes SET Deleted = "true", CategoryName =' +
          '"None", Pinned = "false" WHERE NotesID = ?',
        [noteID],
        null,
        (t, error) => console.log(error)
      );
    });
  });
}

export function restoreDeletedNotes(selectedNotes) {
  selectedNotes.map((noteID) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE Notes SET Deleted = "false" WHERE NotesID = ?',
        [noteID],
        null,
        (t, error) => console.log(error)
      );
    });
  });
}

export function pinNotes(selectedNotes, pinned) {
  selectedNotes.map((noteID) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE Notes SET Pinned = ? WHERE NotesID = ?",
        [pinned, noteID],
        null,
        (t, error) => console.log(error)
      );
    });
  });
}

export function permanentDelete(selectedNotes) {
  selectedNotes.map((noteID) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM Notes WHERE NotesID = ?",
        [noteID],
        null,
        (t, error) => console.log("Error in permanent delete:", error)
      );
    });
  });
}
