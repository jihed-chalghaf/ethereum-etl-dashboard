// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  secretKey: '6CKm7wpxKGXWsxHHPthGoW9qnVFaazxf',
  VAPID_PUBLIC: 'BEn3LfY0L7Hq6X2j4lojZJTYkHKkETkt3HO8acYoXWyk9Lxxt8-6Z0bhke1QI7tYnfcHEIMw0Jiu6hovLlbi8lM',
  SOCKET_ENDPOINT: 'http://localhost:3000/api'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
