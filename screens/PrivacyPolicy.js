import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { Icon } from "react-native-elements";
import { globalStyles } from "../styles/global";

/**
 * Screen to display privacy policy.
 *
 * @param {Object} navigation navigation object
 * @returns PrivacyPolicy screen
 */
const PrivacyPolicy = ({ navigation }) => {
  const handleOpenLink = async () => {
    const url = "https://expo.dev/privacy";
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      Linking.openURL(url);
    } else {
      Alert.alert("", "Cannot open URL");
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={globalStyles.container}>
      <View style={styles.container}>
        <View style={styles.navTab}>
          <TouchableOpacity style={styles.backNavContainer} onPress={goBack}>
            <View style={styles.backButtonContainer}>
              <Icon
                name="arrow-left"
                type="material-community"
                size={18}
                color="#1771F1"
              />
            </View>
            <Text style={styles.navTitleText}>Settings</Text>
          </TouchableOpacity>

          <View style={styles.navHeaderContainer}>
            <Text style={styles.navHeaderText}>Privacy Policy</Text>
          </View>

          <View style={styles.backNavContainer} />
        </View>

        <ScrollView>
          <View style={styles.policyTextContainer}>
            <Text style={styles.policyTextHeader}>
              PLEASE READ THIS POLICY CAREFULLY
            </Text>
            <Text style={styles.policyText}>
              Stephen Okeleke built the Orange Notebook app as a Free app. This
              SERVICE is provided by Stephen Okeleke at no cost and is intended
              for use as is. This page is used to inform visitors regarding my
              policies with the collection, use, and disclosure of Personal
              Information if anyone decided to use my Service. If you choose to
              use my Service, then you agree to the collection and use of
              information in relation to this policy. The Personal Information
              that I collect is used for providing and improving the Service. I
              will not use or share your information with anyone except as
              described in this Privacy Policy. The terms used in this Privacy
              Policy have the same meanings as in our Terms and Conditions,
              which are accessible at Orange Notebook unless otherwise defined in
              this Privacy Policy.
            </Text>

            <Text style={styles.policyTextHeader}>
              INFORMATION COLLECTION AND USE
            </Text>

            <Text style={styles.policyText}>
              For a better experience, while using our Service, I may require
              you to provide us with certain personally identifiable
              information, including but not limited to email. The information
              that I request will be retained on your device and is not
              collected by me in any way. The app does use third-party services
              that may collect information used to identify you. Link to the
              privacy policy of third-party service providers used by the app
            </Text>

            <TouchableOpacity
              style={styles.linkContainer}
              onPress={handleOpenLink}
            >
              <Text>
                &emsp; &bull; <Text style={styles.link}>Expo</Text>
              </Text>
            </TouchableOpacity>

            <Text style={styles.policyTextHeader}>LOG DATA</Text>

            <Text style={styles.policyText}>
              I want to inform you that whenever you use my Service, in a case
              of an error in the app I collect data and information (through
              third-party products) on your phone called Log Data. This Log Data
              may include information such as your device Internet Protocol
              (???IP???) address, device name, operating system version, the
              configuration of the app when utilizing my Service, the time and
              date of your use of the Service, and other statistics.
            </Text>

            <Text style={styles.policyTextHeader}>COOKIES</Text>

            <Text style={styles.policyText}>
              Cookies are files with a small amount of data that are commonly
              used as anonymous unique identifiers. These are sent to your
              browser from the websites that you visit and are stored on your
              device's internal memory. This Service does not use these
              ???cookies??? explicitly. However, the app may use third-party code
              and libraries that use ???cookies??? to collect information and
              improve their services. You have the option to either accept or
              refuse these cookies and know when a cookie is being sent to your
              device. If you choose to refuse our cookies, you may not be able
              to use some portions of this Service.
            </Text>

            <Text style={styles.policyTextHeader}>SERVICE PROVIDERS</Text>

            <Text style={styles.policyText}>
              I may employ third-party companies and individuals due to the
              following reasons:
            </Text>

            <Text style={styles.policyTextList}>
              &emsp; &bull;{" "}
              <Text style={styles.policyText}>To facilitate our Service;</Text>
            </Text>

            <Text style={styles.policyTextList}>
              &emsp; &bull;{" "}
              <Text style={styles.policyText}>
                {" "}
                To provide the Service on our behalf;{" "}
              </Text>
            </Text>

            <Text style={styles.policyTextList}>
              &emsp; &bull;{" "}
              <Text style={styles.policyText}>
                To perform Service-related services; or
              </Text>
            </Text>

            <Text style={styles.policyTextList}>
              &emsp; &bull;{" "}
              <Text style={styles.policyText}>
                To assist us in analyzing how our Service is used;
              </Text>
            </Text>

            <Text style={styles.policyText}>
              I want to inform users of this Service that these third parties
              have access to their Personal Information. The reason is to
              perform the tasks assigned to them on our behalf. However, they
              are obligated not to disclose or use the information for any other
              purpose.
            </Text>

            <Text style={styles.policyTextHeader}>SECURITY</Text>

            <Text style={styles.policyText}>
              I value your trust in providing us your Personal Information, thus
              we are striving to use commercially acceptable means of protecting
              it. But remember that no method of transmission over the internet,
              or method of electronic storage is 100% secure and reliable, and I
              cannot guarantee its absolute security.
            </Text>

            <Text style={styles.policyTextHeader}>LINKS TO OTHER SITE</Text>

            <Text style={styles.policyText}>
              This Service may contain links to other sites. If you click on a
              third-party link, you will be directed to that site. Note that
              these external sites are not operated by me. Therefore, I strongly
              advise you to review the Privacy Policy of these websites. I have
              no control over and assume no responsibility for the content,
              privacy policies, or practices of any third-party sites or
              services.
            </Text>

            <Text style={styles.policyTextHeader}>CHILDREN'S PRIVACY</Text>

            <Text style={styles.policyText}>
              These Services do not address anyone under the age of 13. I do not
              knowingly collect personally identifiable information from
              children under 13 years of age. In the case I discover that a
              child under 13 has provided me with personal information, I
              immediately delete this from our servers. If you are a parent or
              guardian and you are aware that your child has provided us with
              personal information, please contact me so that I will be able to
              do the necessary actions.
            </Text>

            <Text style={styles.policyTextHeader}>CHANGES TO THIS POLICY</Text>

            <Text style={styles.policyText}>
              I may update our Privacy Policy from time to time. Thus, you are
              advised to review this page periodically for any changes. I will
              notify you of any changes by posting the new Privacy Policy on
              this page. This policy is effective as of 2022-04-08.
            </Text>

            <Text style={styles.policyTextHeader}>CONTACT US</Text>

            <Text style={styles.policyText}>
              If you have any questions or suggestions about my Privacy Policy,
              do not hesitate to contact me at stephenokeleke@yahoo.com.
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },

  navTab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    paddingTop: 0,
  },

  backNavContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "30%",
  },

  navHeaderContainer: {
    alignItems: "center",
    width: "40%",
  },

  navHeaderText: {
    fontSize: 19,
    fontWeight: "600",
  },

  backButtonContainer: {
    marginRight: 3,
  },

  navTitleText: {
    fontSize: 14,
    color: "#1771F1",
  },

  policyTextContainer: {
    padding: 15,
    paddingTop: 20,
    paddingBottom: 20,
  },

  policyText: {
    textAlign: "justify",
    marginBottom: 15,
    color: "#58595B",
  },

  policyTextList: {
    marginBottom: 5,
  },

  policyTextHeader: {
    marginBottom: 15,
    fontSize: 14,
    fontWeight: "600",
    color: "#58595B",
    textAlign: "center",
  },

  link: {
    color: "#7EB3FF",
  },

  linkContainer: {
    marginBottom: 15,
    alignSelf: "flex-start",
  },
});

export default PrivacyPolicy;
