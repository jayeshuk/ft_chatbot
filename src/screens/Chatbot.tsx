import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Voice from '@react-native-voice/voice';
import axios from 'axios';
import {Item} from '../types';
import {SPOONACULAR_API_KEY, SPOONACULAR_API_URL} from '@env';

const ChatbotScreen = () => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recipes, setRecipes] = useState<Item[]>([]);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (event: any) => {
    const spokenQuery = event.value[0];
    setQuery(spokenQuery);
    fetchRecipes(spokenQuery);
    setIsListening(false);
  };

  const onSpeechError = (event: any) => {
    console.error(event.error);
    setIsListening(false);
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      await Voice.start('en-US');
    } catch (error) {
      console.error(error);
      setIsListening(false);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRecipes = async (searchQuery: string) => {
    try {
      const response = await axios.get(SPOONACULAR_API_URL, {
        params: {
          query: searchQuery,
          apiKey: SPOONACULAR_API_KEY,
          includeIngredients: true,
        },
      });
      console.log(response.data.results[0])
      const recipeItems: Item[] = response.data.results.map((item: any) => ({
        id: item.id.toString(),
        image: item.image,
        imageType: item.imageType,
        title: item.title,
      }));
      setRecipes(recipeItems);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const handleQuerySubmit = () => {
    fetchRecipes(query);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ChatBot Screen</Text>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <TextInput
          style={styles.input}
          placeholder="Type Recipe Name"
          value={query}
          onChangeText={setQuery}
        />
        <Icon
          size={30}
          color={'#3FA2F6'}
          name={'keyboard-voice'}
          onPress={isListening ? stopListening : startListening}
          style={{position: 'absolute', right: 10, top: 2}}
        />
      </View>
      {isListening ? (
        <Text style={styles.voiceQuery}>
          {isListening ? 'Listening...' : 'Start Voice Query'}
        </Text>
      ) : null}
      <View style={styles.fetchButton}>
        <Button title="Find Recipes" onPress={handleQuerySubmit} />
      </View>
      <FlatList
        data={recipes}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => (
          <View style={styles.recipeItem}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderRadius: 25,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
  },
  fetchButton: {
    marginTop: 20,
  },
  voiceQuery: {
    margin: 10,
    fontSize: 16,
  },
  recipeItem: {
    padding: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  recipeTitle: {
    fontSize: 18,
  },
});

export default ChatbotScreen;
