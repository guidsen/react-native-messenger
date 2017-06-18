import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Pusher from 'pusher-js/react-native';
import ConversationScreen from './src/ConversationScreen';
import config from './config.json';

const initialMessages = [{
  key: 1,
  userId: 1,
  text: 'Hey man, hoe is het?',
}, {
  key: 2,
  userId: 2,
  text: 'Lekker, met jou?',
}, {
  key: 3,
  userId: 1,
  text: 'Ook goed man!',
}];

const socket = new Pusher(config.PUSHER_APP_KEY, {
  authEndpoint: `${config.SERVER_URL}/pusher/auth`,
  cluster: 'eu',
  auth: {
    params: {
      userId: 1,
    },
  },
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: initialMessages,
      typing: false,
      online: false,
      channel: socket.subscribe('presence-conversation'),
    };

    this.addMessage = this.addMessage.bind(this);
  }

  componentDidMount() {
    this.state.channel.bind('pusher:subscription_succeeded', (members) => {
      const memberIds = Object.keys(members.members);

      if (memberIds.some(id => id == 2)) {
        this.setState({ online: true });
      }
    });

    this.state.channel.bind('pusher:member_added', (member) => {
      if (member.id == 2) {
        this.setState({ online: true });
      }
    });

    this.state.channel.bind('pusher:member_removed', (member) => {
      if (member.id == 2) {
        this.setState({ online: false });
      }
    });

    this.state.channel.bind('client-new-message', (data) => {
      if (!data.text || !data.userId) return;

      this.addMessage(data);
    });

    this.state.channel.bind('client-start-typing', (data) => {
      if (!data.userId || data.userId !== 2) return;

      this.setState({ typing: true });
    });

    this.state.channel.bind('client-end-typing', (data) => {
      if (!data.userId || data.userId !== 2) return;

      this.setState({ typing: false });
    });
  }

  componentWillUnmount() {
    socket.unsubscribe('chat-conversation');
  }

  addMessage(message) {
    const newMessages = this.state.messages.concat({
      key: this.state.messages.length + 1,
      text: message.text,
      userId: message.userId,
    });


    this.state.channel.trigger('client-new-message', message);
    this.setState({ messages: newMessages });
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{height: 70, justifyContent: 'center', paddingTop: 20, backgroundColor: '#4a90e2', paddingHorizontal: 5 }}>
          <Text style={{color: 'white'}}>
            Status andere persoon: {this.state.online ? 'online' : 'offline'} --
            typing: {this.state.typing ? 'true' : 'false'}
          </Text>
        </View>
        <ConversationScreen
          messages={this.state.messages}
          onNewMessage={(message) => this.addMessage(message)}
          onStartTyping={() => this.state.channel.trigger('client-start-typing', { userId: 1 })}
          onEndTyping={() => this.state.channel.trigger('client-end-typing', { userId: 1 })}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
