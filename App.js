import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';

const App = () => {
    const [isShaking, setIsShaking] = useState(false);
    const [sound, setSound] = useState(null);

    // Load the sound effect
    async function loadSound() {
        const { sound } = await Audio.Sound.createAsync(
            require('./shake.wav') // Replace with your sound file
        );
        setSound(sound);
    }

    useEffect(() => {
        loadSound();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    // Detect shake using accelerometer
    useEffect(() => {
        const threshold = 1.5; // Adjust sensitivity
        let lastX, lastY, lastZ;

        const subscription = Accelerometer.addListener(({ x, y, z }) => {
            if (lastX !== undefined && lastY !== undefined && lastZ !== undefined) {
                const deltaX = Math.abs(x - lastX);
                const deltaY = Math.abs(y - lastY);
                const deltaZ = Math.abs(z - lastZ);

                if (deltaX + deltaY + deltaZ > threshold) {
                    setIsShaking(true);
                    playSound();

                    // Reset shake state after a short delay
                    setTimeout(() => setIsShaking(false), 500);
                }
            }

            lastX = x;
            lastY = y;
            lastZ = z;
        });

        Accelerometer.setUpdateInterval(100); // Update interval in milliseconds

        return () => subscription.remove();
    }, [sound]);

    // Play the sound effect
    async function playSound() {
        if (sound) {
            await sound.replayAsync();
        }
    }

    return (
        <View style={styles.container}>
            {isShaking ? (
                <Text style={styles.shakeText}>SHAKE</Text>
            ) : (
                <Text style={styles.emptyText}></Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    shakeText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#000',
    },
    emptyText: {
        fontSize: 24,
        color: '#fff',
    },
});

export default App;
