import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ListEstado = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>¿Qué significa cada color?</Text>
            <Text style={styles.description}>
                El color que hay en la parte superior de la(s) imagen(es) de cada uno de los casos en adopción indica el estado en el que se encuentra. A continuación te indicamos el significado de cada uno:
            </Text>

            <View style={styles.itemContainer}>
                <View style={[styles.colorCircle, { backgroundColor: 'green' }]} />
                <Text style={styles.itemText}>
                    <Text style={styles.boldText}>En Adopción:</Text> Se encuentra disponible para la adopción y actualmente está en la protectora o en casa del particular.
                </Text>
            </View>

            <View style={styles.itemContainer}>
                <View style={[styles.colorCircle, { backgroundColor: 'red' }]} />
                <Text style={styles.itemText}>
                    <Text style={styles.boldText}>Urgente:</Text> Por algún motivo en particular se precisa su adopción con rapidez.
                </Text>
            </View>

            <View style={styles.itemContainer}>
                <View style={[styles.colorCircle, { backgroundColor: 'orange' }]} />
                <Text style={styles.itemText}>
                    <Text style={styles.boldText}>Revervado:</Text> Afortunadamente ya ha encontrado un nuevo dueño.
                </Text>
            </View>

            <View style={styles.itemContainer}>
                <View style={[styles.colorCircle, { backgroundColor: 'gray' }]} />
                <Text style={styles.itemText}>
                    <Text style={styles.boldText}>Adoptado:</Text> Se encuentra esperando la confirmación de adopción del interesado. Esto no confirma que vaya a ser adoptado.
                </Text>
            </View>
            <View style={styles.itemContainer}>
                <Text style={styles.itemText}>
                    <Text style={styles.boldText}>Ten encuenta:</Text> Que los unicos que pueden ver que mascotas estan adoptadas y en proceso de adopcion son solo los administradores y encargados.
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#666',
    },
    description: {
        fontSize: 16,
        marginBottom: 25,
        textAlign: 'justify',
        color: '#666',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    colorCircle: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    itemText: {
        fontSize: 16,
        flex: 1,
        textAlign: 'justify',
        color: '#666',
    },
    boldText: {
        fontWeight: 'bold',
        color: '#666',
    },
});

export default ListEstado;
