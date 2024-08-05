import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Voice from '@react-native-voice/voice';
import axios from 'axios';
import {Item} from '../types';
import {SPOONACULAR_API_KEY, SPOONACULAR_API_URL} from '@env';
import IngredientsAndinstructions, {
  Ingredient,
} from '../components/IngredientsAndInstructions';

const ChatbotScreen = () => {
  const [query, setQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recipes, setRecipes] = useState<Item[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [instructions, setInstructions] = useState<string>('');
  const [recipeInfoLoaded, setRecipeInfoLoaded] = useState(false);
  const [recipeListLoaded, setRecipeListLoaded] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (selectedRecipeId !== '') {
      fetchRecipeInfo();
    }
  }, [selectedRecipeId]);

  useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechEnd = onSpeechEnd;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (event: any) => {
    const spokenQuery = event.value[0];
    setRecipeInfoLoaded(false);
    setQuery(spokenQuery);
    fetchRecipes(spokenQuery);
    setIsListening(false);
  };

  const onSpeechError = (event: any) => {
    console.error(event.error);
    setIsListening(false);
  };

  const onSpeechEnd = (event: any) => {
    console.log("ENDED the Speech");
    setIsListening(false)
  }

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
    Keyboard.dismiss();
    setSearching(true);
    try {
      const response = await axios.get(`${SPOONACULAR_API_URL}/complexSearch`, {
        params: {
          query: searchQuery,
          apiKey: SPOONACULAR_API_KEY,
        },
      });
      console.log("LFNKLJDNKLD", `${SPOONACULAR_API_URL}/complexSearch`)
      const recipeItems: Item[] = response.data.results.map((item: any) => ({
        id: item.id.toString(),
        image: item.image,
        imageType: item.imageType,
        title: item.title,
      }));
      setRecipes(recipeItems);
      setRecipeListLoaded(true);
      setSearching(false);
    } catch (error) {
      setSearching(false);
      console.error('Error fetching recipes:', error);
    }
  };

  const fetchRecipeInfo = async () => {
    try {
      const response = await axios.get(
        `${SPOONACULAR_API_URL}/${selectedRecipeId}/information`,
        {
          params: {
            apiKey: SPOONACULAR_API_KEY,
          },
        },
      );
      const {title, image, extendedIngredients, instructions} = response.data;
      setIngredients(extendedIngredients);
      setInstructions(instructions);
      setRecipeInfoLoaded(true);
    } catch (error) {
      console.error('Error fetching recipe info:', error);
      setRecipeInfoLoaded(false);
    }
  };

  const handleQuerySubmit = () => {
    setRecipeInfoLoaded(false);
    fetchRecipes(query);
  };

  const renderRecipeItem = ({item}: {item: any}) => (
    <TouchableOpacity
      style={styles.recipeItem}
      onPress={() => {
        setSelectedRecipeId(item.id);
      }}>
      <Text style={styles.recipeTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderEmptyListNote = () => (
    <Text style={{flex: 1, textAlign: 'center', margin: 50}}>
      {recipeListLoaded ? 'No Recipes Found!' : ''}
    </Text>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RecipeBot</Text>
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
      {searching && (
        <View style={{flex: 1, margin: '10%'}}>
          <ActivityIndicator size={'large'} />
        </View>
      )}
      {recipeInfoLoaded ? (
        <IngredientsAndinstructions
          ingredients={ingredients}
          instructions={instructions}
        />
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={item => item.id.toString()}
          renderItem={renderRecipeItem}
          ListEmptyComponent={renderEmptyListNote}
        />
      )}
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
