import React from 'react';
import { Keyboard, LayoutAnimation, Dimensions, StyleSheet, Text, TextInput, KeyboardAvoidingView, View, FlatList } from 'react-native';

export default class DetailScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = { text: '' };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.messages.length !== this.props.messages.length) {
      this.flatList.scrollToEnd();
    }
  }

  renderMessage(message) {
    const extraStyles = message.item.userId === 1 ? styles.messageLeft : styles.messageRight;

    return (
      <View style={[styles.messageContainer, extraStyles]}>
        <Text style={styles.messageText}>{message.item.text}</Text>
      </View>
    );
  }

  render() {
    return (
      <KeyboardAvoidingView
        behavior="position"
        style={styles.container}
        contentContainerStyle={styles.container}
      >
          <FlatList
            ref={(ref) => this.flatList = ref}
            data={this.props.messages}
            renderItem={this.renderMessage}
          />
          <View>
            <TextInput
              style={{height: 50, color: 'black', fontSize: 16}}
              placeholder="Type your message here..."
              placeholderTextColor="grey"
              returnKeyType="send"
              onFocus={() => this.props.onStartTyping()}
              onChangeText={(text) => {
                this.setState({ text });
              }}
              onEndEditing={(event) => {
                this.props.onEndTyping();
                if (this.state.text === '') return;

                this.setState({ text: '' });
                this.props.onNewMessage({ text: this.state.text, userId: 1 });
              }}
              value={this.state.text}
            />
          </View>
      </KeyboardAvoidingView>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  messageContainer: {
    backgroundColor: 'red',
    padding: 20,
    margin: 5,
    borderRadius: 5,
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
  },
  messageText: {
    color: 'white',
  }
});
