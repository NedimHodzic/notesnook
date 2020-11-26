import React, {useCallback, useEffect} from 'react';
import SimpleList from '../../components/SimpleList';
import {useTracked} from '../../provider';
import {Actions} from '../../provider/Actions';
import SearchService from '../../services/SearchService';
import {inputRef} from '../../utils/Refs';
import {sleep} from '../../utils/TimeUtils';

export const Search = ({route, navigation}) => {
  const [state, dispatch] = useTracked();
  const {searchResults} = state;
  let pageIsLoaded = false;

  const onFocus = useCallback(() => {
    sleep(300).then(() => inputRef.current?.focus());
    if (!pageIsLoaded) {
      console.log('returning since page is not loaded search');
      pageIsLoaded = true;
      return;
    }
    dispatch({
      type: Actions.CURRENT_SCREEN,
      screen: 'search',
    });
    dispatch({
      type: Actions.HEADER_STATE,
      state: false,
    });
    pageIsLoaded = true;
  }, []);

  useEffect(() => {
    navigation.addListener('focus', onFocus);
    return () => {
      pageIsLoaded = false;
      navigation.removeListener('focus', onFocus);
    };
  }, []);

  return (
    <>
      <SimpleList
        data={searchResults}
        type="search"
        focused={() => navigation.isFocused()}
        placeholderText={`Notes you write appear here`}
        jumpToDialog={true}
        CustomHeader={true}
        placeholderData={{
          heading: 'Search',
          paragraph: SearchService.getSearchInformation().placeholder,
          button: null,
        }}
      />
    </>
  );
};
