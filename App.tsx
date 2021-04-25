import React, { useState } from "react";
import { SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";
import * as TodoList from "./todo.module";
import { useAsync, useAsyncCallback } from "react-async-hook";
import { ItemsList } from "./ItemsList";

export interface ITodoInputProps {
  onSubmit(value: string): void;
}

export const TodoInput: React.VFC<ITodoInputProps> = ({ onSubmit }) => {
  const [text, setText] = useState<string>("");

  const handleSubmit = () => {
    if (text) {
      onSubmit(text);
      setText("");
    }
  };

  const handleOnChange = (val: string) => {
    setText(val);
  };

  return (
    <TextInput
      onChangeText={handleOnChange}
      onSubmitEditing={handleSubmit}
      placeholder="what do you need to do?"
      style={styles.input}
      value={text}
    />
  );
};

export default function App() {
  const [items, setItems] = useState<TodoList.IItem[]>([]);

  const componentDidMount = useAsync(async () => {
    await TodoList.createItemsTable();
    const nextItems = await TodoList.getItems();
    setItems(nextItems);
  }, []);

  const handleAddItem = useAsyncCallback(async (itemValue) => {
    const nextItems = await TodoList.insertItem(itemValue);
    setItems(nextItems);
  });

  const handleSetItemToDone = useAsyncCallback(
    async (itemID: TodoList.IItem["id"]) => {
      const { items: nextItems } = await TodoList.updateItemStatusToDone(
        itemID
      );
      setItems(nextItems);
    }
  );

  const handleOnDeleteItem = useAsyncCallback(
    async (itemID: TodoList.IItem["id"]) => {
      const nextItems = await TodoList.deleteItemById(itemID);
      setItems(nextItems);
    }
  );

  return (
    <SafeAreaView style={styles.container}>
      <TodoInput onSubmit={handleAddItem.execute} />
      <ItemsList
        data={items}
        onSetItemToDone={handleSetItemToDone.execute}
        onDeleteItem={handleOnDeleteItem.execute}
      />
      <View>
        <Text>app status</Text>
        <Text>
          {JSON.stringify(
            {
              init: {
                status: componentDidMount.status,
                error: componentDidMount.error?.message,
              },
              addItem: {
                status: handleAddItem.status,
                error: handleAddItem.error?.message,
              },
              completeTask: {
                status: handleSetItemToDone.status,
                error: handleSetItemToDone.error?.message,
              },
              deleteTask: {
                status: handleOnDeleteItem.status,
                error: handleOnDeleteItem.error,
              },
            },
            null,
            2
          )}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  input: {
    borderColor: "black",
    borderRadius: 4,
    borderWidth: 1,
    margin: 16,
    padding: 16,
    fontSize: 16,
  },
});
