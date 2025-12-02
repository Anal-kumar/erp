import { createRouter, createWebHistory } from 'vue-router'
import storage from '@/utils/storage'

// Layouts
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// Auth Views
import Login from '@/views/Login.vue'

// Dashboard Views
import Home from '@/views/Home.vue'

// Mill Operation
import AddTransaction from '@/views/MillOperation/Transaction/AddTransaction.vue'
import ViewTransaction from '@/views/MillOperation/Transaction/ViewTransaction.vue'
import TransactionReport from '@/views/MillOperation/Transaction/TransactionReport.vue'
import ViewStockDetails from '@/views/MillOperation/ViewStockDetails.vue'
import AddParty from '@/views/MillOperation/AddParty.vue'
import AddBroker from '@/views/MillOperation/AddBroker.vue'
import AddTransportor from '@/views/MillOperation/AddTransportor.vue'
import AddGodown from '@/views/MillOperation/AddGodown.vue'
import AddStockItem from '@/views/MillOperation/AddStockItem.vue'
import AddPackage from '@/views/MillOperation/AddPackage.vue'
import AddWeightBridgeOp from '@/views/MillOperation/AddWeightBridgeOp.vue'

// Expiry Reminder
import ExpiryForm from '@/views/ExpiryReminder/ExpiryForm.vue'
import ViewDoc from '@/views/ExpiryReminder/ViewDoc.vue'

// Day Book
import DayForm from '@/views/DayBook/DayForm.vue'
import DayView from '@/views/DayBook/DayView.vue'
import DayBookReport from '@/views/DayBook/DayBookReport.vue'

// Batch
import AddBatch from '@/views/Batch/AddBatch.vue'
import ViewBatch from '@/views/Batch/ViewBatch.vue'
import AddBatchOp from '@/views/Batch/AddBatchOp.vue'
import AddClerk from '@/views/Batch/AddClerk.vue'
import AddImmerse from '@/views/Batch/AddImmerse.vue'
import AddDrainage from '@/views/Batch/AddDrainage.vue'
import AddSteamOn from '@/views/Batch/AddSteamOn.vue'
import AddSteamOff from '@/views/Batch/AddSteamOff.vue'
import AddCrossVerification from '@/views/Batch/AddCrossVerification.vue'
import ViewCrossVerification from '@/views/Batch/ViewCrossVerification.vue'
import AddMillAnalysis from '@/views/Batch/AddMillAnalysis.vue'
import ViewMillAnalysis from '@/views/Batch/ViewMillAnalysis.vue'
import AddSortAnalysis from '@/views/Batch/AddSortAnalysis.vue'
import ViewSortingAnalysis from '@/views/Batch/ViewSortingAnalysis.vue'

// Lot
import AddLot from '@/views/Lot/AddLot.vue'
import ViewLot from '@/views/Lot/ViewLot.vue'
import GraphLot from '@/views/Lot/GraphLot.vue'
import ReportLot from '@/views/Lot/ReportLot.vue'

// Incoming
import IncomeForm from '@/views/Incoming/IncomeForm.vue'
import View from '@/views/Incoming/View.vue'
import IncomingReport from '@/views/Incoming/IncomingReport.vue'

// Outgoing
import OutgoingAdd from '@/views/Outgoing/OutgoingAdd.vue'
import view_outgoingTable from '@/views/Outgoing/view_outgoingTable.vue'
import OutgoingReport from '@/views/Outgoing/OutgoingReport.vue'

// Labor Payment
import AddVoucher from '@/views/LaborPayment/AddVoucher.vue'
import ReportVoucher from '@/views/LaborPayment/ReportVoucher.vue'
import ViewVocher from '@/views/LaborPayment/ViewVocher.vue'
import AddGang from '@/views/LaborPayment/AddGang.vue'
import AddItem from '@/views/LaborPayment/AddItem.vue'
import AddParticular from '@/views/LaborPayment/AddParticular.vue'
import AddPackaging from '@/views/LaborPayment/AddPackaging.vue'
import AddLocation from '@/views/LaborPayment/AddLocation.vue'

// User Management
import AddUser from '@/views/User/AddUser.vue'
import ViewUser from '@/views/User/ViewUser.vue'

// Super Admin
import Modules from '@/views/SuperAdmin/Modules.vue'
import Client from '@/views/SuperAdmin/Client.vue'

// Profile
import MyProfile from '@/views/Profile/MyProfile.vue'
import ChangePass from '@/views/Profile/ChangePass.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public routes (no layout)
    {
      path: '/login',
      name: 'Login',
      component: Login,
    },
    {
      path: '/',
      redirect: '/login'
    },

    // Protected routes (with DashboardLayout)
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/home',
          name: 'Home',
          component: Home,
          meta: { requiresAuth: true }
        },

        // Mill Operation Routes
        {
          path: '/Mill_operation/add_transaction',
          name: 'AddTransaction',
          component: AddTransaction,
          meta: { requiresAuth: true }
        },
        {
          path: '/Mill_operation/view_transaction',
          name: 'ViewTransaction',
          component: ViewTransaction,
          meta: { requiresAuth: true }
        },
        {
          path: '/Mill_operation/report_transaction',
          name: 'TransactionReport',
          component: TransactionReport,
          meta: { requiresAuth: true }
        },
        {
          path: '/Mill_operation/view_stock_detail',
          name: 'ViewStockDetails',
          component: ViewStockDetails,
          meta: { requiresAuth: true }
        },
        {
          path: '/Mill_operation/add_party',
          name: 'AddParty',
          component: AddParty,
          meta: { requiresAuth: true }
        },
        {
          path: '/Mill_operation/add_broker',
          name: 'AddBroker',
          component: AddBroker,
          meta: { requiresAuth: true }
        },
        {
          path: '/Mill_operation/add_transportor',
          name: 'AddTransportor',
          component: AddTransportor,
          meta: { requiresAuth: true }
        },
        {
          path: '/Mill_operation/add_godown',
          name: 'AddGodown',
          component: AddGodown,
          meta: { requiresAuth: true }
        },
        {
          path: '/Mill_operation/add_stock_item',
          name: 'AddStockItem',
          component: AddStockItem,
          meta: { requiresAuth: true }
        },
        {
          path: '/Mill_operation/add_packaging_details',
          name: 'AddPackage',
          component: AddPackage,
          meta: { requiresAuth: true }
        },
        {
          path: '/Mill_operation/add_wb_operator',
          name: 'AddWeightBridgeOp',
          component: AddWeightBridgeOp,
          meta: { requiresAuth: true }
        },

        // Incoming Routes
        {
          path: '/incoming/Add',
          name: 'IncomeForm',
          component: IncomeForm,
          meta: { requiresAuth: true }
        },
        {
          path: '/incoming/View',
          name: 'View',
          component: View,
          meta: { requiresAuth: true }
        },
        {
          path: '/incoming/report',
          name: 'IncomingReport',
          component: IncomingReport,
          meta: { requiresAuth: true }
        },

        // Outgoing Routes
        {
          path: '/outgoing/Add',
          name: 'OutgoingAdd',
          component: OutgoingAdd,
          meta: { requiresAuth: true }
        },
        {
          path: '/outgoing/View',
          name: 'view_outgoingTable',
          component: view_outgoingTable,
          meta: { requiresAuth: true }
        },
        {
          path: '/outgoing/report',
          name: 'OutgoingReport',
          component: OutgoingReport,
          meta: { requiresAuth: true }
        },

        // Labor Payment Routes
        {
          path: '/labour/add_voucher',
          name: 'AddVoucher',
          component: AddVoucher,
          meta: { requiresAuth: true }
        },
        {
          path: '/labour/view_voucher',
          name: 'ViewVoucher',
          component: ViewVocher,
          meta: { requiresAuth: true }
        },
        {
          path: '/labour/report_voucher',
          name: 'ReportVoucher',
          component: ReportVoucher,
          meta: { requiresAuth: true }
        },
        {
          path: '/labor/add_gang',
          name: 'AddGang',
          component: AddGang,
          meta: { requiresAuth: true }
        },
        {
          path: '/labor/add_items',
          name: 'AddItem',
          component: AddItem,
          meta: { requiresAuth: true }
        },
        {
          path: '/labor/add_particulars',
          name: 'AddParticulars',
          component: AddParticular,
          meta: { requiresAuth: true }
        },
        {
          path: '/labor/add_packaging',
          name: 'AddPackaging',
          component: AddPackaging,
          meta: { requiresAuth: true }
        },
        {
          path: '/labor/add_locations',
          name: 'AddLocation',
          component: AddLocation,
          meta: { requiresAuth: true }
        },

        // Expiry Reminder Routes
        {
          path: '/expiry-reminder/add_document',
          name: 'ExpiryReminder',
          component: ExpiryForm,
          meta: { requiresAuth: true }
        },
        {
          path: '/expiry-reminder/view_doc',
          name: 'ViewDoc',
          component: ViewDoc,
          meta: { requiresAuth: true }
        },

        // Day Book Routes
        {
          path: '/daybook/day-form',
          name: 'DayForm',
          component: DayForm,
          meta: { requiresAuth: true }
        },
        {
          path: '/daybook/day-view',
          name: 'DayView',
          component: DayView,
          meta: { requiresAuth: true }
        },
        {
          path: '/daybook/report',
          name: 'DayBookReport',
          component: DayBookReport,
          meta: { requiresAuth: true }
        },

        // Batch Routes
        {
          path: '/batch_detail/add_batch',
          name: 'AddBatch',
          component: AddBatch,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/view_batch',
          name: 'ViewBatch',
          component: ViewBatch,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/add_operator',
          name: 'AddBatchOp',
          component: AddBatchOp,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/add_clerk',
          name: 'AddClerk',
          component: AddClerk,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/add_immerse',
          name: 'AddImmerse',
          component: AddImmerse,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/add_drainage',
          name: 'AddDrainage',
          component: AddDrainage,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/add_steam_on',
          name: 'AddSteamOn',
          component: AddSteamOn,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/add_steam_off',
          name: 'AddSteamOff',
          component: AddSteamOff,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/add_cross_verification',
          name: 'AddCrossVerification',
          component: AddCrossVerification,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/view_cross_Verification',
          name: 'ViewCrossVerification',
          component: ViewCrossVerification,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/add_milling_analysis',
          name: 'AddMillAnalysis',
          component: AddMillAnalysis,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_detail/view_milling_anyalysis',
          name: 'ViewMillAnalysis',
          component: ViewMillAnalysis,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_details/add_sorting_analysis',
          name: 'AddSortAnalysis',
          component: AddSortAnalysis,
          meta: { requiresAuth: true }
        },
        {
          path: '/batch_details/view_sorting_analysis',
          name: 'ViewSoringAnalysis',
          component: ViewSortingAnalysis,
          meta: { requiresAuth: true }
        },

        // Lot Routes
        {
          path: '/lot/add',
          name: 'AddLot',
          component: AddLot,
          meta: { requiresAuth: true }
        },
        {
          path: '/lot/view',
          name: 'ViewLot',
          component: ViewLot,
          meta: { requiresAuth: true }
        },
        {
          path: '/lot/graph',
          name: 'GraphLot',
          component: GraphLot,
          meta: { requiresAuth: true }
        },
        {
          path: '/lot/report',
          name: 'ReportLot',
          component: ReportLot,
          meta: { requiresAuth: true }
        },

        // User Management Routes
        {
          path: '/users/add',
          name: 'AddUser',
          component: AddUser,
          meta: { requiresAuth: true }
        },
        {
          path: '/users/view',
          name: 'ViewUser',
          component: ViewUser,
          meta: { requiresAuth: true }
        },

        // Profile Routes
        {
          path: '/profile/my-profile',
          name: 'MyProfile',
          component: MyProfile,
          meta: { requiresAuth: true }
        },
        {
          path: '/profile/change-password',
          name: 'ChangePass',
          component: ChangePass,
          meta: { requiresAuth: true }
        },

        // Super Admin Routes
        {
          path: '/superadmin/modules',
          name: 'Modules',
          component: Modules,
          meta: { requiresAuth: true }
        },
        {
          path: '/superadmin/client-info',
          name: 'Client',
          component: Client,
          meta: { requiresAuth: true }
        },
      ]
    }
  ],
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = storage.isAuthenticated()

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      // No token, redirect to login
      next('/login')
    } else {
      // Token exists, allow navigation
      next()
    }
  } else {
    // Route doesn't require auth
    if (to.path === '/login' && isAuthenticated) {
      // User is already logged in, redirect to home
      next('/home')
    } else {
      next()
    }
  }
})

export default router
