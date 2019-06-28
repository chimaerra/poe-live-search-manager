import React from "react";
import { Switch, Route } from "react-router-dom";
import Input from "./Input/Input";
import Trade from "./Trade/Trade";
import Account from "./Account/Account";
import Settings from "./Settings/Settings";

const screens = () => (
  <Switch>
    <Route path="/input" component={Input} />
    <Route path="/trade" component={Trade} />
    <Route path="/account" component={Account} />
    <Route path="/settings" component={Settings} />
  </Switch>
);

export default screens;
