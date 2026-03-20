type NavigationLike = {
  getState?: () => { routeNames?: string[] } | undefined;
  navigate: (name: string, params?: unknown) => void;
};

export function navigateToCustomerTab(
  navigation: NavigationLike,
  routeName: string,
): void {
  const routeNames = navigation.getState?.()?.routeNames ?? [];

  if (routeNames.includes(routeName)) {
    navigation.navigate(routeName);
    return;
  }

  if (routeNames.includes('CustomerTabs')) {
    navigation.navigate('CustomerTabs', { screen: routeName });
    return;
  }

  navigation.navigate(routeName);
}