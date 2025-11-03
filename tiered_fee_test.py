#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class TieredFeeSystemTester:
    def __init__(self, base_url="https://swapmetrics.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", error=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {error}")
        
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "error": error
        })

    def test_tiered_fee_tier_boundaries(self):
        """Test Suite 1: Tier-Grenzen Validierung - Test all 6 tier levels with real API calls"""
        print("\n🎯 Test Suite 1: Tier Boundaries Validation")
        
        # Test cases with expected tiers
        test_cases = [
            {"usd_amount": 900, "expected_tier": "T1_0_1k", "expected_fee": 0.35, "description": "$900 Trade"},
            {"usd_amount": 1500, "expected_tier": "T2_1k_5k", "expected_fee": 0.30, "description": "$1,500 Trade"},
            {"usd_amount": 6000, "expected_tier": "T3_5k_10k", "expected_fee": 0.25, "description": "$6,000 Trade"},
            {"usd_amount": 12000, "expected_tier": "T4_10k_50k", "expected_fee": 0.20, "description": "$12,000 Trade"},
            {"usd_amount": 55000, "expected_tier": "T5_50k_100k", "expected_fee": 0.15, "description": "$55,000 Trade"},
            {"usd_amount": 120000, "expected_tier": "T6_100k_plus", "expected_fee": 0.10, "description": "$120,000 Trade"}
        ]
        
        all_passed = True
        results = []
        
        for test_case in test_cases:
            success = self._test_single_tier_boundary(test_case)
            results.append(success)
            if not success:
                all_passed = False
        
        self.log_test("Tiered Fee - All Tier Boundaries", all_passed, 
                     f"Tested {len(test_cases)} tier boundaries: {sum(results)}/{len(results)} passed",
                     "" if all_passed else f"Failed {len(results) - sum(results)} tier boundary tests")
        return all_passed
    
    def _test_single_tier_boundary(self, test_case):
        """Test a single tier boundary"""
        try:
            usd_amount = test_case["usd_amount"]
            expected_tier = test_case["expected_tier"]
            expected_fee = test_case["expected_fee"]
            description = test_case["description"]
            
            # Calculate sellAmount in Wei based on USD value
            # Assume ETH price of $3500 for calculation
            eth_price = 3500.0
            eth_amount = usd_amount / eth_price
            sell_amount_wei = str(int(eth_amount * 10**18))
            
            test_data = {
                "sellToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",  # ETH
                "buyToken": "0xdac17f958d2ee523a2206206994597c13d831ec7",   # USDT
                "sellAmount": sell_amount_wei,
                "takerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
                "chain": "ethereum"
            }
            
            response = requests.post(
                f"{self.api_url}/evm/quote",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check tiered fee fields
                fee_tier = data.get("feeTier")
                fee_percent = data.get("feePercent")
                fee_usd = data.get("feeUsd")
                amount_in_usd = data.get("amountInUsd")
                
                # Validate tier
                tier_correct = fee_tier == expected_tier
                fee_correct = abs(fee_percent - expected_fee) < 0.001
                
                # Validate mathematical consistency
                if fee_usd is not None and amount_in_usd is not None:
                    expected_fee_usd = amount_in_usd * (fee_percent / 100)
                    fee_calculation_correct = abs(fee_usd - expected_fee_usd) <= 0.02
                else:
                    fee_calculation_correct = True  # Skip if values are None
                
                success = tier_correct and fee_correct and fee_calculation_correct
                
                details = f"{description}: Tier={fee_tier} (expected {expected_tier}), Fee={fee_percent}% (expected {expected_fee}%)"
                if fee_usd is not None and amount_in_usd is not None:
                    details += f", USD Amount=${amount_in_usd:.2f}, Fee USD=${fee_usd:.2f}"
                
                if not success:
                    error = f"Tier mismatch or fee calculation error"
                else:
                    error = ""
                
                self.log_test(f"Tier Boundary - {description}", success, details, error)
                return success
            else:
                # API error - might be expected due to external dependencies
                self.log_test(f"Tier Boundary - {description}", False, 
                             f"API Error: {response.status_code}", 
                             f"Could not test due to API error: {response.text[:200]}")
                return False
                
        except Exception as e:
            self.log_test(f"Tier Boundary - {description}", False, "", str(e))
            return False

    def test_tiered_fee_api_response_validation(self):
        """Test Suite 2: API Response Field Validation"""
        print("\n📋 Test Suite 2: API Response Field Validation")
        
        try:
            # Test with a mid-tier amount
            test_data = {
                "sellToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",  # ETH
                "buyToken": "0xdac17f958d2ee523a2206206994597c13d831ec7",   # USDT
                "sellAmount": "1428571428571428571",  # ~$5000 worth of ETH
                "takerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
                "chain": "ethereum"
            }
            
            response = requests.post(
                f"{self.api_url}/evm/quote",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check required tiered fee fields
                required_fields = [
                    "feeTier", "feePercent", "feeUsd", "amountInUsd", 
                    "netAmountIn", "originalAmountIn", "nextTier", 
                    "notes", "quoteVersion"
                ]
                
                missing_fields = []
                for field in required_fields:
                    if field not in data:
                        missing_fields.append(field)
                
                # Check backward compatibility fields
                backward_compat_fields = ["platformFee", "chain", "chain_id"]
                missing_compat_fields = []
                for field in backward_compat_fields:
                    if field not in data:
                        missing_compat_fields.append(field)
                
                # Check mathematical consistency
                math_consistent = True
                math_errors = []
                
                if data.get("feeUsd") is not None and data.get("amountInUsd") is not None:
                    expected_fee_usd = data.get("amountInUsd") * (data.get("feePercent", 0) / 100)
                    actual_fee_usd = data.get("feeUsd")
                    if abs(actual_fee_usd - expected_fee_usd) > 0.02:
                        math_consistent = False
                        math_errors.append(f"Fee USD calculation: expected ~{expected_fee_usd:.2f}, got {actual_fee_usd}")
                
                # Check netAmountIn < originalAmountIn
                try:
                    net_amount = int(data.get("netAmountIn", "0"))
                    original_amount = int(data.get("originalAmountIn", "0"))
                    if net_amount >= original_amount:
                        math_consistent = False
                        math_errors.append("netAmountIn should be less than originalAmountIn")
                except ValueError:
                    math_errors.append("netAmountIn or originalAmountIn not valid integers")
                
                success = (len(missing_fields) == 0 and 
                          len(missing_compat_fields) == 0 and 
                          math_consistent)
                
                details = f"Required fields: {len(required_fields) - len(missing_fields)}/{len(required_fields)} present"
                if missing_fields:
                    details += f", Missing: {missing_fields}"
                if missing_compat_fields:
                    details += f", Missing compat: {missing_compat_fields}"
                if math_errors:
                    details += f", Math errors: {math_errors}"
                
                self.log_test("API Response Field Validation", success, details,
                             "" if success else "Missing required fields or math inconsistency")
                return success
            else:
                self.log_test("API Response Field Validation", False,
                             f"API Error: {response.status_code}",
                             f"Could not validate fields due to API error")
                return False
                
        except Exception as e:
            self.log_test("API Response Field Validation", False, "", str(e))
            return False

    def test_tiered_fee_edge_cases(self):
        """Test Suite 6: Edge Cases"""
        print("\n⚡ Test Suite 6: Edge Cases")
        
        edge_cases = [
            {"amount": 1, "description": "Very small amount ($1)", "expected_tier": "T1_0_1k"},
            {"amount": 1000000, "description": "Very large amount ($1M)", "expected_tier": "T6_100k_plus"},
            {"amount": 999.99, "description": "Just below $1000", "expected_tier": "T1_0_1k"},
            {"amount": 1000.00, "description": "Exactly $1000", "expected_tier": "T2_1k_5k"},
            {"amount": 4999.99, "description": "Just below $5000", "expected_tier": "T2_1k_5k"},
            {"amount": 5000.00, "description": "Exactly $5000", "expected_tier": "T3_5k_10k"}
        ]
        
        all_passed = True
        
        for case in edge_cases:
            try:
                usd_amount = case["amount"]
                description = case["description"]
                expected_tier = case["expected_tier"]
                
                # Calculate ETH amount
                eth_price = 3500.0
                eth_amount = usd_amount / eth_price
                sell_amount_wei = str(int(eth_amount * 10**18))
                
                test_data = {
                    "sellToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                    "buyToken": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                    "sellAmount": sell_amount_wei,
                    "takerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
                    "chain": "ethereum"
                }
                
                response = requests.post(
                    f"{self.api_url}/evm/quote",
                    json=test_data,
                    headers={"Content-Type": "application/json"},
                    timeout=30
                )
                
                if response.status_code == 200:
                    data = response.json()
                    actual_tier = data.get("feeTier")
                    
                    success = actual_tier == expected_tier
                    if not success:
                        all_passed = False
                    
                    self.log_test(f"Edge Case - {description}", success,
                                 f"Expected: {expected_tier}, Got: {actual_tier}",
                                 "" if success else "Tier mismatch")
                else:
                    all_passed = False
                    self.log_test(f"Edge Case - {description}", False,
                                 f"API Error: {response.status_code}", "API call failed")
                    
            except Exception as e:
                all_passed = False
                self.log_test(f"Edge Case - {description}", False, "", str(e))
        
        return all_passed

    def test_tiered_fee_error_handling(self):
        """Test Suite 7: Error Handling"""
        print("\n🚨 Test Suite 7: Error Handling")
        
        error_tests = [
            {
                "name": "Missing sellAmount",
                "data": {
                    "sellToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                    "buyToken": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                    "takerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
                    "chain": "ethereum"
                },
                "expected_status": 422
            },
            {
                "name": "Invalid chain",
                "data": {
                    "sellToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                    "buyToken": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                    "sellAmount": "1000000000000000000",
                    "takerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
                    "chain": "invalid_chain"
                },
                "expected_status": 400
            }
        ]
        
        all_passed = True
        
        for test in error_tests:
            try:
                response = requests.post(
                    f"{self.api_url}/evm/quote",
                    json=test["data"],
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                success = response.status_code == test["expected_status"]
                if not success:
                    all_passed = False
                
                self.log_test(f"Error Handling - {test['name']}", success,
                             f"Expected: {test['expected_status']}, Got: {response.status_code}",
                             "" if success else "Wrong error status code")
                
            except Exception as e:
                all_passed = False
                self.log_test(f"Error Handling - {test['name']}", False, "", str(e))
        
        return all_passed

    def test_tiered_fee_feature_flag(self):
        """Test Suite 8: Feature Flag Behavior"""
        print("\n🏁 Test Suite 8: Feature Flag Behavior")
        
        try:
            test_data = {
                "sellToken": "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                "buyToken": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
                "sellAmount": "1000000000000000000",
                "takerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
                "chain": "ethereum"
            }
            
            response = requests.post(
                f"{self.api_url}/evm/quote",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check current behavior (should be tiered since FEE_TIERED_ENABLED=true in .env)
                fee_tier = data.get("feeTier")
                quote_version = data.get("quoteVersion")
                
                if fee_tier == "LEGACY":
                    # Feature flag is disabled
                    success = (data.get("feePercent") == 0.20 and 
                              quote_version == "v1-legacy")
                    details = "Feature flag disabled: Legacy 0.2% fee active"
                else:
                    # Feature flag is enabled (current state)
                    success = quote_version == "v1-tiered"
                    details = f"Feature flag enabled: Tiered fees active (Tier: {fee_tier})"
                
                self.log_test("Feature Flag Behavior", success, details,
                             "" if success else "Unexpected feature flag behavior")
                return success
            else:
                self.log_test("Feature Flag Behavior", False,
                             f"API Error: {response.status_code}",
                             "Could not test feature flag due to API error")
                return False
                
        except Exception as e:
            self.log_test("Feature Flag Behavior", False, "", str(e))
            return False

    def run_comprehensive_tiered_fee_tests(self):
        """Run complete tiered fee system test suite"""
        print("\n" + "="*80)
        print("🎯 AUTOMATISCHE QA: DYNAMIC TIERED FEES SYSTEM")
        print("="*80)
        
        test_results = []
        
        # Run all test suites
        test_results.append(self.test_tiered_fee_tier_boundaries())
        test_results.append(self.test_tiered_fee_api_response_validation())
        test_results.append(self.test_tiered_fee_edge_cases())
        test_results.append(self.test_tiered_fee_error_handling())
        test_results.append(self.test_tiered_fee_feature_flag())
        
        # Calculate results
        passed_suites = sum(test_results)
        total_suites = len(test_results)
        
        print(f"\n🏆 TIERED FEE SYSTEM TEST RESULTS:")
        print(f"Test Suites Passed: {passed_suites}/{total_suites}")
        print(f"Individual Tests: {self.tests_passed}/{self.tests_run}")
        print(f"Success Rate: {(passed_suites/total_suites)*100:.1f}%")
        
        if passed_suites == total_suites:
            print("🟢 ALL TIERED FEE TESTS PASSED - SYSTEM READY FOR PRODUCTION")
        else:
            print("🔴 SOME TIERED FEE TESTS FAILED - REVIEW REQUIRED")
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['error']}")
        
        return passed_suites == total_suites

if __name__ == "__main__":
    tester = TieredFeeSystemTester()
    success = tester.run_comprehensive_tiered_fee_tests()
    sys.exit(0 if success else 1)