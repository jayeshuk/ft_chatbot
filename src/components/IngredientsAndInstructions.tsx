import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';

export type Ingredient = {
  id: string;
  name: string;
};

type Props = {
  ingredients: Ingredient[];
  instructions: string;
};

export default function IngredientsAndinstructions({
  ingredients,
  instructions,
}: Props) {
  const {width} = useWindowDimensions();

  return (
    <ScrollView>
      <View style={styles.ingredientsView}>
        <Text style={styles.heading}>Ingredients:</Text>
        {ingredients.map((ingredient, index) => (
          <Text key={index} style={styles.ingredient}>
            {index + 1}. {ingredient.name}
          </Text>
        ))}
      </View>
      <View style={[styles.ingredientsView, styles.instructionsView]}>
        <Text style={styles.heading}>Instructions:</Text>
        <RenderHtml
          contentWidth={width}
          source={{
            html: instructions,
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ingredientsView: {
    marginLeft: 10,
    marginTop: 10,
  },
  instructionsView: {
    marginTop: 10,
  },
  ingredient: {
    textTransform: 'capitalize',
  },
  heading: {
    fontWeight: 'bold',
    fontSize: 22,
  },
});
