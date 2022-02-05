import { StyleSheet } from 'react-native'

export const globalStyles = StyleSheet.create({
    container: {
        flex: 1,
        // alignItems: 'center',
        // justifyContent: 'center',
        // borderWidth: 5,
        // borderColor: "green",
        backgroundColor: '#f8f8f9'
      }, 

      yellowButton: {
        backgroundColor: '#FED876',
        padding: 13,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 35,
        flexDirection: 'row',
      },

      whiteButton: {
        backgroundColor: '#FFF',
        padding: 13,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        flexDirection: 'row'
      },

      buttonText: {
        color: '#000',
        fontWeight: '500'
      },

      headerText: {
        fontSize: 25,
        fontFamily: 'LatoBold',
        fontWeight: '700',
        textAlign: 'center'
      },
      
})