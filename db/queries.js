import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("notes.db");

/**
 * Get list of categories in database.
 *
 * @param {function} selectCategoriesCallback callback
 * in which result is passed to
 */
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

/**
 * Create new category.
 *
 * @param {string} name category name
 * @param {int} red red component of rgb color
 * @param {int} green green component of rgb color
 * @param {int} blue blue component of rgb color
 * @param {int} updateNotesCallBack callback called to move
 * notes into new category if category was created with indirectly
 */
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
 * @param {array} notes notes to be updated
 * @param {string} categoryName new category name
 * @param {function} navigationCallback function called after completion
 * @param {function} retries number of retries after error
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

/**
 * Edit category.
 *
 * @param {string} name new category name
 * @param {int} red new red component of rgb color
 * @param {int} green new green component of rgb color
 * @param {int} blue new blue component of rgb color
 * @param {string} oldName old category name
 */
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

/**
 * Delete category.
 *
 * @param {array} selectedCategories list of categories to be deleted
 * @param {function} deleteCategoryCallBack callback called after category
 * is deleted successfully
 */
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

/**
 * Selects categories and the number of notes in category.
 *
 * @param {function} updateCallback callback called after category
 * retrieved.
 */
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

/**
 * Edit a note.
 *
 * @param {string} titleText new title
 * @param {string} labelText new label
 * @param {string} contentText new content
 * @param {date} date date of edit
 * @param {int} id note id
 */
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

/**
 * Create note.
 *
 * @param {string} titleText title of note
 * @param {string} category note category (none by default)
 * @param {string} labelText note label
 * @param {string} contentText note content
 * @param {date} date date of creation
 * @param {long} time time stamp when note created
 */
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

/**
 * Get notes.
 *
 * @param {boolean} deleted set to true to obtain deleted notes
 * @param {boolean} pinned set to true to obtain pinned notes
 * @param {function} allNoteCallback callback called after notes retrieved
 * successfully
 */
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

/**
 * Get notes of a certain category.
 *
 * @param {boolean} pinned set to true to retrieve pinned notes
 * @param {string} category category to look up
 * @param {function} noteCategoryCallback callback called after notes retrieved
 */
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

/**
 * Move notes to recycle bin.
 *
 * @param {array} selectedNotes notes to be temporarily deleted.
 */
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

/**
 * Restore deleted notes.
 *
 * @param {array} selectedNotes notes to be restored
 */
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

/**
 * Pin or unpin notes.
 *
 * @param {array} selectedNotes notes to be pinned or unpinned
 * @param {boolean} pinned set to true to pin or false to unpin
 */
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

/**
 * Permanently remove notes from database.
 *
 * @param {function} selectedNotes callback called on
 * successful delete
 */
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

/**
 * Enable or disable two factor authentication in database.
 * This is called when the two factor setting from the server
 * is synced with the local db.
 *
 * @param {boolean} isEnabled true to enable and false to disable
 */
export function setTwoFactor(isEnabled) {
  db.transaction((tx) => {
    tx.executeSql(
      "UPDATE Settings Set SettingEnabled = ? WHERE SettingName = 'TwoFactor'",
      [isEnabled],
      null,
      (t, error) => console.log("Error in permanent delete:", error)
    );
  });
}
