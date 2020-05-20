/*
 * @Author: litingwei
 * @Date: 2019-09-17 14:19:30
 * @LastEditTime: 2020-03-07 00:06:38
 * @LastEditors: litingwei
 */
import React from "react";
import ReactDom from "react-dom";

import { getJSON } from "./common/dataService";
import { envCfg } from "./common/envCfg";
import global from "./common/global";
import util from "./common/util";
import URLS from "./constants/URLS";

//main
import Main from "./containers/Main";
// import MyRoom from './containers/myRoom/myRoom';
// import RoomList from './containers/roomList/roomList';
// import RoomDetail from './containers/roomDetail/RoomDetail';

import Home from "./containers/home/Home";
import Notice from "./containers/notice/Notice";
import Post from "./containers/post/Post";
import ExaminePost from "./containers/examinePost/Post";
import unablePage from "./components/unablePage/Index";
import Question from "./containers/question/Question";
import School from "./containers/school/School";
import Subject from "./containers/subject/Subject";
import CourseDetail from "./containers/courseDetail/CourseDetail";
import MajorDetail from "./containers/courseDetail/MajorDetail";
import SupplyIntro from "./containers/courseDetail/SupplyIntro";
import Landing from "./containers/landing/Landing";
import Static from "./containers/static/Static";
import CaseHub from "./containers/caseHub/CaseHub";
import SideEffect from "./containers/sideEffect/SideEffect";
import HonorsDay from "./components/honorsDay/index";
import PersonalProfile from "./containers/personalProfile/Index";

import LearnGroupRank from "./containers/learnGroupRank/LearnGroupRank";

import Examine from "./containers/examine/Examine";
import CourseLandingPage from "./containers/courseLandingPage/Index";
import GuideCareLandingPage from './containers/guideCareLandingPage/Index'
import WxBindOrUnBind from './containers/wxBindOrUnBind/Index'
import UserCenterInfo from './containers/userCenterInfo/Index'

import PublicBenefitHome from './containers/publicBenefitHome/index'
import PublicBenefitList from './containers/publicBenefitList/index'
import PublicBenefitDetail from './containers/publicBenefitDetail/index'
import PublicBenefitIntro from './containers/publicBenefitIntro/index'
import ExamTask from './containers/examTask/Index'
import ExamVideo from 'Containers/examVideo/Index'
import ComposeCard from './containers/examTask/composeCard'
import ComposeRule from './components/examTask/composeRule/Index'
import AppDownload from 'Components/appDownload/Index'
//login
//import Login from './containers/login/login'
const stat = _ => {
  var hm = document.createElement("script");

  hm.src = envCfg.postStatisticsUrl;

  var s = document.getElementsByTagName("script")[0];

  s.parentNode.insertBefore(hm, s);

  hm.onload = function() {
    _hmt.push(["_setAutoPageview", false]);

    let hash = window.location.hash.split("?")[0];
    _hmt.push(["_trackPageview", `/community-pc-war/m/index.html${hash}`]);

    s.parentNode.removeChild(hm);
  };
};

const routes = [
  {
    path: "/",
    component: Main,
    indexRoute: { component: Home },
    childRoutes: [
      {
        path: "question/:questionId",
        component: Question,
        onEnter: () => {
          stat();
        }
      },
      {
        path: "answer/:answerId",
        component: Question,
        onEnter: () => {
          stat();
        }
      },
      {
        path: "topic/:topicName",
        component: Home,
        onEnter: () => {
          stat();
        }
      },
      {
        path: "topic/:topicName/:topicId",
        component: Home,
        onEnter: () => {
          stat();
        }
      },
      {
        path: "notice/:groupId",
        component: Notice
      },
      {
        path: "systemNotice/:sysMessageId",
        component: Notice
      },
      {
        path: "unablePage",
        component: unablePage
      },
      {
        path: "subject/:subjectId",
        component: Subject
      },
      {
        path: "course",
        component: CourseDetail
      },
      {
        path: "major",
        component: MajorDetail
      },
      {
        path: "supply",
        component: SupplyIntro
      },
      {
        path: "landing/:page",
        component: Landing
      },
      {
        path: "static/:page",
        component: Static
      },
      {
        path: "profileDetail/:postMasterId",
        component: Post
      },
      {
        path: "examineProfileDetail/:postMasterId",
        component: ExaminePost
      },
      {
        path: "post/:postMasterId",
        component: Post,
        onEnter: (nextState, replace) => {
          var hm = document.createElement("script");

          hm.src = envCfg.postStatisticsUrl;

          var s = document.getElementsByTagName("script")[0];

          s.parentNode.insertBefore(hm, s);

          hm.onload = function() {
            _hmt.push(["_setAutoPageview", false]);

            let hash = window.location.hash.split("?")[0];
            _hmt.push([
              "_trackPageview",
              `/community-pc-war/m/index.html${hash}`
            ]);
          };
        }
      },
      {
        path: "school/:videoId",
        component: School,
        onEnter: (nextState, replace) => {
          stat();
        }
      },
      {
        path: "caseHub",
        component: CaseHub,
        onEnter: (nextState, replace) => {
          // stat()
        }
      },
      {
        path: "sideEffect",
        component: SideEffect
      },
      {
        path: "personalProfile/:userIdEncoded",
        component: PersonalProfile
      },
      {
        path: "honorsDay",
        component: HonorsDay
      },
      {
        path: "learnGroupRank",
        component: LearnGroupRank
      },
      {
        path: "examine",
        component: Examine
      },
      {
        path: "courseLandingPage",
        component: CourseLandingPage
      },
      {
        path: "guideCareLandingPage",
        component: GuideCareLandingPage,
      },
      {
        path: 'wxBindOrUnBind/:flag',
        component: WxBindOrUnBind,
      },
      {
        path: 'userCenterInfo',
        component: UserCenterInfo,
      },
      {
        path: "publicBenefitHome",
        component: PublicBenefitHome,
      },
      {
        path: "publicBenefitList",
        component: PublicBenefitList,
      },
      {
        path: "publicBenefitDetail/:projectNo",
        component: PublicBenefitDetail,
      },
      {
        path: "publicBenefitIntro",
        component: PublicBenefitIntro,
      },
      {
        path: 'examTask',
        component: ExamTask,
      },
      {
        path: 'composeCard',
        component: ComposeCard,
      },
      {
        path: 'composeRule',
        component: ComposeRule,
      },
      {
        path: 'examVideo',
        component: ExamVideo,
      }, {
        path: 'appDownload',
        component: AppDownload,
      },
    ]
  }
];

export default routes;
