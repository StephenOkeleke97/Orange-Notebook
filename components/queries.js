import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("notes.db");

export function selectCategories(selectCategoriesCallback) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT CategoryName FROM Category C",
      null,
      (t, { rows: { _array } }) => {
        selectCategoriesCallback(_array);
      },
      (t, error) => console.log("Error in select categories:", error)
    );
  });
}

export function createCategory(name, red, green, blue, updateNotesCallBack) {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO Category(CategoryName, RedColor, GreenColor, BlueColor) VALUES (" +
        "?, ?, ?, ?)",
      [name, red, green, blue],
      (t, success) => {
        updateNotesCallBack();
      },
      (t, error) => {
        console.log("Error creating category:", error);
      }
    );
  });
}

/**
 * Add notes to category after creation of
 * category. Sometimes, the this method is
 * called before the transaction to create category is
 * over. The number of retries indicates how many times
 * the method should be called when that happens.
 *
 * @param {*} notes notes to be updated
 * @param {*} categoryName new category name
 * @param {*} navigationCallback function called after completion
 * @param {*} retries number of retries after error
 */
export function updateNoteCategories(
  notes,
  categoryName,
  navigationCallback,
  retries
) {
  if (retries > 0) {
    notes.forEach((note, index, array) => {
      db.transaction((tx) => {
        tx.executeSql(
          "UPDATE Notes SET CategoryName = ? WHERE NotesID = ?",
          [categoryName, note],
          (t, success) => {
            if (index === array.length - 1) navigationCallback();
          },
          (t, error) => {
            updateNoteCategories(
              notes,
              categoryName,
              navigationCallback,
              retries - 1
            );
            console.log(t);
            console.log("Error updating notes when create category:", error);
          }
        );
      });
    });
  }
}

export function editCategory(name, red, green, blue, oldName) {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE Category SET CategoryName = ?, RedColor = ?, GreenColor = ?, BlueColor = ? " +
        "WHERE CategoryName = ?",
      [name, red, green, blue, oldName],
      null,
      (t, error) => {
        console.log("Error in edit category:", error);
      }
    );
  });
}

export function deleteCategory(selectedCategories, deleteCategoryCallBack) {
  selectedCategories.forEach((categoryName) => {
    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE Notes SET CategoryName = "None", Deleted = "true" WHERE CategoryName = ?',
        [categoryName],
        null,
        (t, error) => {
          console.log(
            "Error setting notes deleted = true in delete category",
            error
          );
        }
      );
      tx.executeSql(
        "DELETE FROM Category WHERE CategoryName = ?",
        [categoryName],
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

export function updateCategoryList(updateCallback) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT COUNT(NotesID) AS NumOfNotes, C.CategoryName, RedColor, GreenColor, BlueColor " +
        "FROM Category C LEFT JOIN Notes N on C.CategoryName = N.CategoryName " +
        'GROUP BY C.CategoryName HAVING C.CategoryName != "None"',
      null,
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
  category,
  labelText,
  contentText,
  date,
  time
) {
  db.transaction((tx) => {
    tx.executeSql(
      "INSERT INTO Notes(Title, CategoryName, Label, Content, DateAdded, TimeStamp, Deleted, Pinned, Synced) VALUES (" +
        '?, ?, ?, ?, ?, ?, "false", "false", "false")',
      [titleText, category, labelText, contentText, date, time],
      null,
      (t, error) => console.log("Error in create note:", error)
    );
  });
}

export function selectAllNotes(deleted, pinned, allNoteCallback) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor " +
        "FROM Notes N LEFT JOIN Category C ON N.CategoryName = C.CategoryName  " +
        "WHERE Deleted = ? AND Pinned = ? ORDER BY TimeStamp DESC",
      [deleted, pinned],
      (t, { rows: { _array } }) => {
        allNoteCallback(_array);
      },
      (t, error) => console.log("Error in select all notes:", error)
    );
  });
}

export function selectNotesOfCategory(pinned, category, noteCategoryCallback) {
  db.transaction((tx) => {
    tx.executeSql(
      "SELECT NotesID, Title, Content, N.CategoryName, Label, DateAdded, RedColor, GreenColor, BlueColor " +
        "FROM Notes N LEFT JOIN Category C ON N.CategoryName = C.CategoryName " +
        'WHERE Deleted = "false" AND Pinned = ? AND N.CategoryName = ? ORDER BY TimeStamp DESC',
      [pinned, category],
      (t, { rows: { _array } }) => {
        noteCategoryCallback(_array);
      },
      (t, error) => console.log("Error in select category notes:", error)
    );
  });
}

export function deleteNotes(selectedNotes) {
  selectedNotes.forEach((noteID) => {
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
  selectedNotes.forEach((noteID) => {
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
  selectedNotes.forEach((noteID) => {
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
  selectedNotes.forEach((noteID) => {
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
