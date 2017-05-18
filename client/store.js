import { createStore } from 'redux';
import rootReducer from './reducers/rootReducer'
import branches from './data/branches'

var myBranch = null;
if(localStorage) { myBranch = localStorage.getItem('branch') }
const defaultState = {
  branches: branches,
  currentListItem: {},
  myBranch: JSON.parse(myBranch) || {}
}
const store = createStore(rootReducer, defaultState)

export default store