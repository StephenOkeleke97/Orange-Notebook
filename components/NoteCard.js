import { View,
StyleSheet,
Text} from 'react-native';
import { Icon } from 'react-native-elements';
import { useFonts } from 'expo-font';
import { useEffect, useState } from 'react';
import { TouchableOpacity } from 'react-native';

export default function NodeCard({ id, index, title, content, category, label, date, getSelectMode, setSelectMode,
redColor, greenColor, blueColor, addToSelectedNotes, removeFromSelectedNotes, getSelected, triggerSelectAll, navigate}) {
    const [selected, setSelected] = useState(false);
    useEffect(() => {
        if (getSelectMode() === false) {
            setSelected(false);
        } else {
            setSelected(getSelected());
        }
    }, [triggerSelectAll, getSelectMode()]);

    const noteClick = () => {
        if (getSelectMode()) {
            if(!selected) {
                addToSelectedNotes(id);
            } else {
                removeFromSelectedNotes(id);
            }
            setSelected(!selected);
        } else {
            navigate('Edit', title, category, label, content, id)
        }
    }

    const selectMode = getSelectMode();
    const [loaded] = useFonts({
        Overpass: require('../assets/fonts/Overpass-Regular.ttf'),
        OverpassBold: require('../assets/fonts/Overpass-SemiBold.ttf'),
      });
      
      if (!loaded) {
        return null;
      }

    return (
        <TouchableOpacity onPress={() => noteClick()} onLongPress={() => setSelectMode()} activeOpacity={0.7}>
            <View style={[styles.cardContainer, {backgroundColor: `rgba(${redColor}, ${greenColor}, ${blueColor}, 0.2)`}]}>
                <View>
                    <View style={styles.header}>
                        <View style={styles.headerTextContainer}>
                        <Text numberOfLines={2} style={styles.headerText}>{title}</Text>
                        </View>
                        {selectMode && <View style={styles.selected}> 
                            {selected ? <Icon
                            name='checkmark-circle'
                            type='ionicon'
                            color='#1771F1'
                            size={21}
                            /> :
                            <Icon
                            name='ellipse'
                            type='ionicon'
                            color='#fff'  
                            size={20}              
                            />
                            }
                        </View>}

                    </View>
                        <View style={styles.body}>
                            <Text numberOfLines={index === 0 ? 3 : 1} style={styles.bodyText}>{content}</Text>
                        </View>
             
                    <View style={styles.footer}>
                        <View style={styles.category}> 
                            <Text style={styles.footerText} numberOfLines={1}>{category}</Text>
                        </View>
                        <View style={styles.date}>
                            <Text numberOfLines={1} style={styles.label}>{label}</Text>
                            <Text style={styles.footerText}>{date}</Text>
                        </View>
                    </View>
            </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1
    },

    cardContainer: {
        borderRadius: 15,
        padding: 20,
        // backgroundColor: '#fef4d4',
        marginBottom: 12,
        flexDirection: 'row',
    },

    header: {
        flexDirection: 'row'
    },

    headerText: {
        fontSize: 18,
        fontFamily: 'OverpassBold',
    },

    headerTextContainer: {
        width: '90%'
    },

    selected: {
        width: '10%',
    },

    body: {
        paddingTop: 10,
    },

    bodyText: {
        fontSize: 15,
        fontFamily: 'Overpass',
        color: '#808285',
    },

    footer: {
        flexDirection: 'row',
        paddingTop: 25,
    },

    category: {
        borderRightWidth: 1,
        borderRightColor: '#D1D3D4',
        width: '25%',
        justifyContent: 'center',
        paddingRight: 10,
    },

    date: {
        width: '75%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 10,
    },

    label: {
        width: '40%',
        fontFamily: 'OverpassBold',
        fontSize: 14,
        color: '#808285',
    },

    footerText: {
        fontFamily: 'OverpassBold',
        fontSize: 14,
        color: '#808285',
    },

});