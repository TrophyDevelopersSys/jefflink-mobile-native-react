import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  name: string;
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: string | null;
}

/**
 * Wraps a component tree and catches render-time errors that would
 * otherwise produce a blank screen with no console output.
 * Set `name` to identify which section crashed in the logs.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      error: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    console.log(`[ErrorBoundary: ${this.props.name}] crashed`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>⚠ {this.props.name} crashed</Text>
          <Text style={styles.message}>{this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#FEE2E2",
    margin: 8,
    borderRadius: 8,
  },
  title: {
    fontWeight: "700",
    color: "#991B1B",
    marginBottom: 4,
  },
  message: {
    color: "#7F1D1D",
    fontSize: 12,
  },
});
