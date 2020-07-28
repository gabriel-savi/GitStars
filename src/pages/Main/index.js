import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Keyboard, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import Icon from 'react-native-vector-icons/MaterialIcons';

import api from '../../services/api';
import {
         Container,
         Form,
         Input,
         SubmitButton,
         List,
         User,
         Avatar,
         Name,
         Bio,
         ProfileButton,
         ProfileButtonText,
         DeleteButton,
         DeleteButtonText,
         Buttons
       } from './styles';

class Main extends Component {
  static navigationOptions = {
    title: 'Usuários',
  };

  static propTypes = {
    navigation: PropTypes.shape({
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    newUser: '',
    users: [],
    loading: false,
    error: false
  };

  async componentDidMount() {
    const users = await AsyncStorage.getItem('users');

    if (users) {
      this.setState({ users: JSON.parse(users) });
    }
  }

  async componentDidUpdate(_, prevState) {
    if (prevState.users !== this.state.users) {
      AsyncStorage.setItem('users', JSON.stringify(this.state.users));
    }
  }

  handleAddUser = async () => {
    const { users, newUser } = this.state;

    this.setState({ loading: true });
    try {
      if (newUser === '') {
        throw this.setState({ error: true });
      }

      const response = await api.get(`/users/${newUser}`);

      const user = users.find((u) => u.login === response.data.login);

      if(user) {
        throw this.setState({ error: true });
      }

      const data = {
        name: response.data.name,
        login: response.data.login,
        bio: response.data.bio,
        avatar: response.data.avatar_url,
      };

      this.setState({
        users: [...users, data],
        newUser: '',
        loading: false,
      });

      Keyboard.dismiss();
    } catch(ex) {
      this.setState({ loading: false })
      Keyboard.dismiss();
    }

  }

  handleNavigate = (user) => {
    const { navigation } = this.props;

    navigation.navigate('User', { user });
  }

  async handleDeleteUser(user){
    const index = this.state.users.indexOf(user);

    this.state.users.splice(index, 1);

    await AsyncStorage.setItem('users', JSON.stringify(this.state.users));

    this.setState({ users: JSON.parse(await AsyncStorage.getItem('users')) });
  }

  render() {
    const { users, newUser, loading, error } = this.state;

    return (
      <Container>
        <Form>
          <Input
            autoCorrect={false}
            autoCapitalize="none"
            placeholder="Adicionar usuário"
            value={newUser}
            onChangeText={text => this.setState({ newUser: text })}
            returnKeyType="send"
            onSubmitEditing={this.handleAddUser}
            error={error}
          />

          <SubmitButton loading={loading} onPress={this.handleAddUser}>
            { loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Icon name="add" size={20} color="#FFF" />
            )}
          </SubmitButton>
        </Form>

        <List
          data={users}
          keyExtractor={user => user.login}
          renderItem={({ item }) => (
            <User>
              <Avatar source={{ uri: item.avatar }} />
              <Name>{item.name}</Name>
              <Bio>{item.bio}</Bio>
              <Buttons>
                <ProfileButton onPress={() => this.handleNavigate(item)}>
                  <ProfileButtonText>Ver perfil</ProfileButtonText>
                </ProfileButton>
                <DeleteButton onPress={() => this.handleDeleteUser(item)}>
                  <DeleteButtonText>Excluir</DeleteButtonText>
                </DeleteButton>
              </Buttons>
            </User>
          )}
        />
      </Container>
    );
  }
};

export default Main;
