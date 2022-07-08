import React, { RefObject, useState } from "react";
import {
  ColorValue,
  NativeSyntheticEvent,
  TextInput,
  TextInputProps,
  TextInputSubmitEditingEventData,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  ERRORS_LIST,
  validateEmail,
  validatePass,
  validateUsername
} from "../../../services/validation";
import { useThemeStore } from "../../../stores/use-theme-store";
import { getElevation } from "../../../utils";
import { SIZE } from "../../../utils/size";
import { IconButton } from "../icon-button";
import Paragraph from "../typography/paragraph";
interface InputProps extends TextInputProps {
  fwdRef?: RefObject<TextInput>;
  validationType?:
    | "password"
    | "email"
    | "confirmPassword"
    | "username"
    | "phonenumber";
  loading?: boolean;
  onSubmit?: (
    event: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => void | undefined;
  onErrorCheck?: (error: boolean) => void;
  errorMessage?: string;
  customColor?: ColorValue;
  customValidator?: () => string;
  marginBottom?: number;
  button?: {
    icon: string;
    color: ColorValue;
    onPress: () => void;
    testID?: string;
  };
  buttons?: React.ReactNode;
  onBlurInput?: () => void;
  onPress?: () => void;
  height?: number;
  fontSize?: number;
  onFocusInput?: () => void;
  marginRight?: number;
  buttonLeft?: React.ReactNode;
  inputStyle?: TextInputProps["style"];
  containerStyle?: ViewStyle;
}

const Input = ({
  fwdRef,
  validationType,
  loading,
  onChangeText,
  onSubmit,
  onErrorCheck,
  errorMessage,
  secureTextEntry,
  customColor,
  customValidator,
  marginBottom = 10,
  button,
  onBlurInput,
  onPress,
  height = 50,
  fontSize = SIZE.md,
  onFocusInput,
  buttons,
  marginRight,
  buttonLeft,
  inputStyle = {},
  containerStyle = {},
  ...restProps
}: InputProps) => {
  const colors = useThemeStore((state) => state.colors);
  const [error, setError] = useState(false);
  const [focus, setFocus] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const [showError, setShowError] = useState(false);
  const [errorList, setErrorList] = useState({
    SHORT_PASS: true
    //  NO_ABC: true,
    //  NO_CAPS_ABC: true,
    //  NO_NUM: true,
    //  SPECIAL: true,
  });

  const color = error
    ? colors.red
    : focus
    ? customColor || colors.accent
    : colors.nav;

  const validate = async (value: string) => {
    if (!validationType) return;
    if (!value || value?.length === 0) {
      setError(false);
      onErrorCheck && onErrorCheck(false);
      setErrorList({
        SHORT_PASS: true
      });
      return;
    }
    let isError:
      | boolean
      | string
      | { SHORT_PASS?: boolean; isValid?: boolean }
      | undefined = undefined;

    switch (validationType) {
      case "password":
        isError = validatePass(value);
        break;
      case "email":
        isError = validateEmail(value);
        break;
      case "username":
        isError = validateUsername(value);
        break;
      case "confirmPassword":
        isError = customValidator && value === customValidator();
        break;
      case "phonenumber": {
        const { default: phone } = await import("phone");
        const result = phone(value, {
          strictDetection: true,
          validateMobilePrefix: true
        });
        console.log(result);
        isError = result.isValid;
        if (result.isValid) {
          onChangeText && onChangeText(result.phoneNumber);
        }

        break;
      }
    }

    if (validationType === "password") {
      let hasError = false;

      const errors = isError as { [name: string]: boolean };
      Object.keys(errors).forEach((e) => {
        //ts-ignore
        if (errors[e] === true) {
          hasError = true;
        }
      });
      setError(hasError);
      onErrorCheck && onErrorCheck(hasError);
      setErrorList(errors as { SHORT_PASS: boolean });
    } else {
      setError(!isError);
      onErrorCheck && onErrorCheck(!isError);
    }
  };

  const onChange = (value: string) => {
    onChangeText && onChangeText(value);
    setShowError(false);
    validate(value);
  };

  const onBlur = () => {
    setFocus(false);
    if (onBlurInput) {
      onBlurInput();
    }
  };

  const onFocus = () => {
    setFocus(true);
    if (onFocusInput) {
      onFocusInput();
    }
  };

  const style: ViewStyle = {
    borderWidth: 1,
    borderRadius: 5,
    borderColor: color,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexGrow: 1,
    height: height || 50,
    paddingHorizontal: 12,
    paddingRight: buttons || button || secureTextEntry || error ? 6 : 12,
    ...containerStyle
  };

  const textStyle: TextInputProps["style"] = {
    paddingHorizontal: 0,
    fontSize: fontSize,
    color: onPress && loading ? colors.accent : colors.pri,
    paddingVertical: 0,
    paddingBottom: 2.5,
    flexGrow: 1,
    height: height || 50,
    flexShrink: 1,
    fontFamily: "OpenSans-Regular",
    //@ts-ignore
    ...inputStyle
  };

  return (
    <>
      <View
        importantForAccessibility="yes"
        style={{
          height: height,
          marginBottom: marginBottom,
          flexGrow: 1,
          maxHeight: height,
          marginRight: marginRight
        }}
      >
        <TouchableOpacity
          disabled={!loading}
          onPress={onPress}
          activeOpacity={1}
          style={style}
        >
          {buttonLeft && buttonLeft}

          <TextInput
            {...restProps}
            ref={fwdRef}
            editable={!loading}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType={
              validationType === "email"
                ? "email-address"
                : restProps.keyboardType
            }
            importantForAutofill="yes"
            importantForAccessibility="yes"
            keyboardAppearance={colors.night ? "dark" : "light"}
            onFocus={onFocus}
            onSubmitEditing={onSubmit}
            style={textStyle}
            secureTextEntry={secureTextEntry && secureEntry}
            placeholderTextColor={colors.placeholder}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              height: 35 > height ? height : 35,
              alignItems: "center"
            }}
          >
            {secureTextEntry && (
              <IconButton
                name="eye"
                size={20}
                top={10}
                bottom={10}
                onPress={() => {
                  fwdRef?.current?.blur();
                  setSecureEntry(!secureEntry);
                }}
                style={{
                  width: 25,
                  marginLeft: 5
                }}
                color={secureEntry ? colors.icon : colors.accent}
              />
            )}

            {buttons}

            {button && (
              <IconButton
                testID={button.testID}
                name={button.icon}
                size={SIZE.xl}
                top={10}
                bottom={10}
                onPress={button.onPress}
                color={button.color}
              />
            )}

            {error && (
              <IconButton
                name="alert-circle-outline"
                top={10}
                bottom={10}
                onPress={() => {
                  setShowError(!showError);
                }}
                size={20}
                style={{
                  width: 25,
                  marginLeft: 5
                }}
                color={colors.errorText}
              />
            )}
          </View>

          {error && showError && errorMessage ? (
            <View
              style={{
                position: "absolute",
                backgroundColor: colors.nav,
                paddingVertical: 3,
                paddingHorizontal: 5,
                borderRadius: 2.5,
                ...getElevation(2),
                top: 0
              }}
            >
              <Paragraph
                size={SIZE.xs}
                style={{
                  textAlign: "right",
                  textAlignVertical: "bottom"
                }}
              >
                <Icon
                  name="alert-circle-outline"
                  size={SIZE.xs}
                  color={colors.errorText}
                />{" "}
                {errorMessage}
              </Paragraph>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {validationType === "password" && focus && (
        <View
          style={{
            marginTop: -5,
            marginBottom: 5
          }}
        >
          {
            //@ts-ignore
            Object.keys(errorList).filter((k) => errorList[k] === true)
              .length !== 0
              ? Object.keys(ERRORS_LIST).map((error) => (
                  <View
                    //@ts-ignore
                    key={ERRORS_LIST[error]}
                    style={{
                      flexDirection: "row",
                      alignItems: "center"
                    }}
                  >
                    <Icon
                      //@ts-ignore
                      name={errorList[error] ? "close" : "check"}
                      //@ts-ignore
                      color={errorList[error] ? "red" : "green"}
                    />

                    <Paragraph style={{ marginLeft: 5 }} size={SIZE.xs}>
                      {
                        //@ts-ignore
                        ERRORS_LIST[error]
                      }
                    </Paragraph>
                  </View>
                ))
              : null
          }
        </View>
      )}
    </>
  );
};

export default Input;